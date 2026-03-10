import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Banner } from './schemas/banner.schema';
import {
  CreateBannerDto,
  BannerQueryDto,
  UpdateBannerDto,
} from './dto/banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private readonly bannerModel: Model<Banner>,
  ) {}

  async create(dto: CreateBannerDto, userId: string): Promise<Banner> {
    const banner = new this.bannerModel({
      ...dto,
      createdBy: new Types.ObjectId(userId),
    });
    return banner.save();
  }

  async findAll(query: BannerQueryDto) {
    const { page = '1', limit = '10', status, pages } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (pages) filter.pages = pages;

    const [banners, total] = await Promise.all([
      this.bannerModel
        .find(filter)
        .populate('createdBy', 'name email role')
        .populate('updatedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      this.bannerModel.countDocuments(filter),
    ]);

    return {
      banners,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerModel
      .findById(id)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  // Public endpoint - only active banners for a specific page
  async findByPage(page: string): Promise<Banner[]> {
    return this.bannerModel
      .find({ pages: page, status: 'active' })
      .sort({ createdAt: -1 })
      .lean();
  }

  async update(
    id: string,
    dto: UpdateBannerDto,
    userId: string,
  ): Promise<Banner> {
    const updateData = { ...dto };
    delete (updateData as any).createdBy;
    updateData.updatedBy = userId;

    const banner = await this.bannerModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async remove(id: string): Promise<{ message: string }> {
    const banner = await this.bannerModel.findByIdAndDelete(id);
    if (!banner) throw new NotFoundException('Banner not found');
    return { message: 'Banner deleted successfully' };
  }
}
