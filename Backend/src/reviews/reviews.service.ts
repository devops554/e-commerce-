import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewStatus } from '../products/schemas/review.schema';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) { }

  async create(customerId: string, dto: any) {
    const { orderId, productId, rating, comment, images, deliveryRating, deliveryComment } = dto;

    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    // Safely extract the user id whether it is a raw ObjectId or a populated doc
    const rawUser = order.user as any;
    const orderUserId = rawUser?._id ? rawUser._id.toString() : rawUser?.toString();

    if (orderUserId !== customerId.toString()) {
      throw new BadRequestException('You can only review your own orders');
    }
    // Optional: check if order is DELIVERED
    // if (order.status !== 'DELIVERED') throw new BadRequestException('Order must be delivered');

    // 2. Check for duplicate review per product in this order
    const existing = await this.reviewModel.findOne({
      orderId: new Types.ObjectId(orderId),
      productId: new Types.ObjectId(productId)
    });
    if (existing) throw new BadRequestException('Review already submitted for this product in this order');

    // 3. Create review
    const review = new this.reviewModel({
      rating,
      comment,
      images,
      productId: new Types.ObjectId(productId),
      orderId: new Types.ObjectId(orderId),
      customerId: new Types.ObjectId(customerId),
      deliveryRating,
      deliveryComment,
      status: ReviewStatus.PENDING,
    });

    const savedReview = await review.save();
    return savedReview;
  }

  async findAll(query: any) {
    const { productId, customerId, orderId, status, page = 1, limit = 10 } = query;
    const filter: any = {};
    if (productId) filter.productId = new Types.ObjectId(productId);
    if (customerId) filter.customerId = new Types.ObjectId(customerId);
    if (orderId) filter.orderId = new Types.ObjectId(orderId);
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('customerId', 'name email profilePic')
        .populate('productId', 'title slug thumbnail')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const review = await this.reviewModel
      .findById(id)
      .populate('customerId', 'name email profilePic')
      .populate('productId', 'title slug thumbnail')
      .populate('orderId')
      .exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async moderate(id: string, adminId: string, dto: { status: ReviewStatus; rejectionReason?: string }) {
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException('Review not found');

    review.status = dto.status;
    review.moderatedBy = new Types.ObjectId(adminId);
    review.moderatedAt = new Date();
    if (dto.rejectionReason) review.rejectionReason = dto.rejectionReason;

    const savedReview = await review.save();

    // If approved, update product rating
    if (dto.status === ReviewStatus.APPROVED) {
      await this.updateProductRating(review.productId.toString());
    }

    return savedReview;
  }

  private async updateProductRating(productId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId), status: ReviewStatus.APPROVED } },
      {
        $group: {
          _id: '$productId',
          ratingsAverage: { $avg: '$rating' },
          ratingsCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await this.productModel.findByIdAndUpdate(productId, {
        ratingsAverage: stats[0].ratingsAverage,
        ratingsCount: stats[0].ratingsCount,
      });
    } else {
      await this.productModel.findByIdAndUpdate(productId, {
        ratingsAverage: 0,
        ratingsCount: 0,
      });
    }
  }

  async delete(id: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException('Review not found');

    const productId = review.productId.toString();
    const result = await this.reviewModel.findByIdAndDelete(id);

    // Recalculate rating after deletion
    await this.updateProductRating(productId);

    return result;
  }
}
