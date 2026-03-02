import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { ProductType } from './schemas/product-type.schema';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductTypesService {
    private readonly logger = new Logger(ProductTypesService.name);

    constructor(
        @InjectModel(ProductType.name) private productTypeModel: Model<ProductType>,
        private readonly redisService: RedisService,
    ) { }

    // ─── HELPER METHODS ───

    private validateObjectId(id: string, name: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid ${name} ID format: ${id}`);
        }
    }

    private async invalidateCache() {
        try {
            // Simple invalidation by pattern or clearing all product-types related keys
            await this.redisService.delByPattern('product-types:*');

            // Also clear product list caches because they contain populated product type data
            await this.redisService.delByPattern('products:*');
        } catch (error) {
            this.logger.warn(`Cache invalidation failed in ProductTypesService: ${error.message}`);
        }
    }

    // ─── CORE CRUD ───

    async create(createProductTypeDto: CreateProductTypeDto, createdBy: string): Promise<ProductType> {
        try {
            const slug = createProductTypeDto.slug || slugify(createProductTypeDto.name, { lower: true, strict: true });

            const existing = await this.productTypeModel.findOne({ slug }).exec();
            if (existing) {
                throw new ConflictException(`Product Type with slug "${slug}" already exists`);
            }

            if (createProductTypeDto.order === undefined) {
                const lastType = await this.productTypeModel.findOne().sort({ order: -1 }).exec();
                createProductTypeDto.order = lastType ? lastType.order + 1 : 1;
            }

            const productType = new this.productTypeModel({
                ...createProductTypeDto,
                slug,
                createdBy: new Types.ObjectId(createdBy)
            });

            const saved = await productType.save();
            this.invalidateCache().catch(() => { });

            this.logger.log(`Product Type created: ${saved.name} (${saved._id})`);
            return saved;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to create product type: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to create product type');
        }
    }

    async findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }) {
        try {
            const { page = 1, limit = 10, search, isActive } = query;
            const skip = (page - 1) * limit;

            const filter: any = {};
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ];
            }
            if (isActive !== undefined) {
                filter.isActive = isActive;
            }

            const cacheKey = `product-types:${JSON.stringify(filter)}:${page}:${limit}`;
            const cached = await this.redisService.get(cacheKey);
            if (cached) return cached;

            const [productTypes, total] = await Promise.all([
                this.productTypeModel
                    .find(filter)
                    .populate('createdBy', 'name')
                    .sort({ order: 1, _id: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                this.productTypeModel.countDocuments(filter).exec(),
            ]);

            const result = {
                productTypes,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };

            this.redisService.set(cacheKey, result, 3600).catch(() => { });
            return result;
        } catch (error) {
            this.logger.error(`Failed to fetch product types: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch product types');
        }
    }

    async findOne(idOrSlug: string): Promise<ProductType> {
        try {
            const productType = await this.productTypeModel
                .findOne({
                    $or: [{ _id: Types.ObjectId.isValid(idOrSlug) ? idOrSlug : null }, { slug: idOrSlug }],
                })
                .populate('createdBy', 'name')
                .exec();

            if (!productType) {
                throw new NotFoundException(`Product Type "${idOrSlug}" not found`);
            }
            return productType;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to fetch product type ${idOrSlug}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Resource fetch failed');
        }
    }

    async update(id: string, updateProductTypeDto: UpdateProductTypeDto, userId: string): Promise<ProductType> {
        try {
            this.validateObjectId(id, 'product type');
            const updateData: any = { ...updateProductTypeDto };

            // Ensure createdBy is NOT updated
            delete updateData.createdBy;

            // Track who updated this
            updateData.updatedBy = new Types.ObjectId(userId);

            if (updateProductTypeDto.name && !updateProductTypeDto.slug) {
                updateData.slug = slugify(updateProductTypeDto.name, { lower: true, strict: true });
            }

            const productType = await this.productTypeModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .exec();

            if (!productType) {
                throw new NotFoundException(`Product Type ID ${id} not found`);
            }

            this.invalidateCache().catch(() => { });
            this.logger.log(`Product Type updated: ${productType.name} (${id})`);
            return productType;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to update product type ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Update failed');
        }
    }

    async remove(id: string): Promise<void> {
        try {
            this.validateObjectId(id, 'product type');
            const result = await this.productTypeModel.findByIdAndDelete(id).exec();
            if (!result) {
                throw new NotFoundException(`Product Type ID ${id} not found`);
            }
            this.invalidateCache().catch(() => { });
            this.logger.warn(`Product Type deleted: ${result.name} (${id})`);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to delete product type ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Delete operation failed');
        }
    }
}
