import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import slugify from 'slugify';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly redisService: RedisService,
  ) {}

  // ─── HELPER METHODS ───

  private validateObjectId(id: string, name: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${name} ID format: ${id}`);
    }
  }

  private async clearCategoryCache(id?: string, slug?: string) {
    try {
      // Clear list cache
      await this.redisService.delByPattern('categories:*');

      // Also clear product list caches because they contain populated category data
      await this.redisService.delByPattern('products:*');
      if (id) {
        await this.redisService.del(`category:detail:${id}`);
      }
      if (slug) {
        await this.redisService.del(`category:detail:${slug}`);
      }
    } catch (error) {
      this.logger.warn(
        `Cache clear failed in CategoriesService: ${error.message}`,
      );
    }
  }

  // ─── CORE CRUD ───

  async create(
    createCategoryDto: CreateCategoryDto,
    createdBy: string,
  ): Promise<Category> {
    try {
      const slug =
        createCategoryDto.slug ||
        slugify(createCategoryDto.name, { lower: true, strict: true });

      const existing = await this.categoryModel.findOne({ slug }).exec();
      if (existing) {
        throw new ConflictException(
          `Category with slug "${slug}" already exists`,
        );
      }

      if (createCategoryDto.order === undefined) {
        const lastCategory = await this.categoryModel
          .findOne()
          .sort({ order: -1 })
          .exec();
        createCategoryDto.order = lastCategory ? lastCategory.order + 1 : 1;
      }

      const category = new this.categoryModel({
        ...createCategoryDto,
        slug,
        createdBy: new Types.ObjectId(createdBy),
      });

      const saved = await category.save();
      this.clearCategoryCache().catch(() => {});

      this.logger.log(`Category created: ${saved.name} (${saved._id})`);
      return saved;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to create category: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    productType?: string;
    parentId?: string | null;
    isActive?: boolean;
    sort?: string;
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        productType,
        parentId,
        isActive,
        sort,
      } = query;
      const skip = (page - 1) * limit;

      const sortOption: any = sort ? sort : { order: 1, _id: -1 };

      const filter: any = {};
      if (search) {
        filter.$text = { $search: search };
      }
      if (productType) {
        filter.productType = productType;
      }
      if (parentId !== undefined) {
        filter.parentId = parentId;
      }
      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      const cacheKey = `categories:${JSON.stringify(filter)}:${sort}:${skip}:${limit}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;

      const [categories, total] = await Promise.all([
        this.categoryModel
          .find(filter)
          .populate('productType')
          .populate('createdBy', 'name')
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.categoryModel.countDocuments(filter).exec(),
      ]);

      const result = {
        categories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      this.redisService.set(cacheKey, result, 3600).catch(() => {});

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch categories: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(idOrSlug: string): Promise<Category> {
    try {
      const cacheKey = `category:detail:${idOrSlug}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;

      const category = await this.categoryModel
        .findOne({
          $or: [
            { _id: Types.ObjectId.isValid(idOrSlug) ? idOrSlug : null },
            { slug: idOrSlug },
          ],
        })
        .populate('productType')
        .populate('createdBy', 'name')
        .exec();

      if (!category) {
        throw new NotFoundException(`Category "${idOrSlug}" not found`);
      }

      this.redisService.set(cacheKey, category, 3600).catch(() => {});
      return category;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to fetch category ${idOrSlug}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Resource fetch failed');
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<Category> {
    try {
      this.validateObjectId(id, 'category');
      const updateData: any = { ...updateCategoryDto };

      // Ensure createdBy is NOT updated
      delete updateData.createdBy;

      // Track who updated this
      updateData.updatedBy = new Types.ObjectId(userId);

      if (updateCategoryDto.name && !updateCategoryDto.slug) {
        updateData.slug = slugify(updateCategoryDto.name, {
          lower: true,
          strict: true,
        });
      }

      const category = await this.categoryModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      if (!category) {
        throw new NotFoundException(`Category ID ${id} not found`);
      }

      this.clearCategoryCache(id, category.slug).catch(() => {});
      this.logger.log(`Category updated: ${category.name} (${id})`);
      return category;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to update category ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Update failed');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.validateObjectId(id, 'category');
      const category = await this.categoryModel.findById(id).exec();
      if (!category) {
        throw new NotFoundException(`Category ID ${id} not found`);
      }

      await this.categoryModel.findByIdAndDelete(id).exec();

      // Handle children (set parentId to null)
      await this.categoryModel
        .updateMany({ parentId: id }, { parentId: null })
        .exec();

      this.clearCategoryCache(id, category.slug).catch(() => {});
      this.logger.warn(`Category deleted: ${category.name} (${id})`);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to delete category ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Delete operation failed');
    }
  }

  // ─── UTILITY METHODS ───

  async getSubCategoryIds(parentId: string): Promise<string[]> {
    try {
      const children = await this.categoryModel
        .find({ parentId })
        .select('_id')
        .exec();
      const childIds = children.map((c) => c._id.toString());

      let allIds = [...childIds];
      for (const id of childIds) {
        const nestedIds = await this.getSubCategoryIds(id);
        allIds = [...allIds, ...nestedIds];
      }
      return allIds;
    } catch (error) {
      this.logger.error(
        `Failed to fetch subcategories for ${parentId}: ${error.message}`,
      );
      return [];
    }
  }
}
