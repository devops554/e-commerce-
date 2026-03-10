import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Types } from 'mongoose';

@Injectable()
export class CartsService {
  private readonly logger = new Logger(CartsService.name);

  constructor(private readonly redisService: RedisService) {}

  // ─── HELPER METHODS ───

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  private validateObjectId(id: string, name: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${name} ID format: ${id}`);
    }
  }

  // ─── CORE CART OPERATIONS ───

  async getCart(userId: string) {
    try {
      this.validateObjectId(userId, 'user');
      const cart = await this.redisService.hgetall(this.getCartKey(userId));
      return cart || {};
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to get cart for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve cart data');
    }
  }

  async addItem(
    userId: string,
    productId: string,
    variantId: string,
    quantity: number,
    title?: string,
    price?: number,
    image?: string,
  ) {
    try {
      this.validateObjectId(userId, 'user');
      this.validateObjectId(productId, 'product');
      this.validateObjectId(variantId, 'variant');

      if (quantity === 0) return this.getCart(userId);

      const cartKey = this.getCartKey(userId);
      const existingItem: any = await this.redisService.hget(
        cartKey,
        variantId,
      );

      const newQuantity = (existingItem?.quantity || 0) + quantity;

      if (newQuantity <= 0) {
        await this.redisService.hdel(cartKey, variantId);
        this.logger.log(
          `Item ${variantId} removed from cart for user ${userId} (quantity <= 0)`,
        );
      } else {
        const newItem = {
          productId,
          variantId,
          title: title || existingItem?.title || '',
          price: price || existingItem?.price || 0,
          image: image || existingItem?.image || '',
          quantity: newQuantity,
          updatedAt: new Date().toISOString(),
        };
        await this.redisService.hset(cartKey, variantId, newItem);
        this.logger.log(
          `Item ${variantId} updated in cart for user ${userId} (qty: ${newQuantity})`,
        );
      }

      return this.getCart(userId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to add item to cart for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update cart items');
    }
  }

  async removeItem(userId: string, variantId: string) {
    try {
      this.validateObjectId(userId, 'user');
      await this.redisService.hdel(this.getCartKey(userId), variantId);
      this.logger.log(`Item ${variantId} removed from cart for user ${userId}`);
      return this.getCart(userId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to remove item from cart for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to remove item from cart');
    }
  }

  async clearCart(userId: string) {
    try {
      this.validateObjectId(userId, 'user');
      await this.redisService.del(this.getCartKey(userId));
      this.logger.log(`Cart cleared for user ${userId}`);
      return { message: 'Cart cleared successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to clear cart for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to clear cart data');
    }
  }

  async syncCart(
    userId: string,
    items: {
      productId: string;
      variantId: string;
      quantity: number;
      title: string;
      price: number;
      image: string;
    }[],
  ) {
    try {
      this.validateObjectId(userId, 'user');
      if (!items || items.length === 0) return this.getCart(userId);

      const cartKey = this.getCartKey(userId);

      for (const item of items) {
        try {
          this.validateObjectId(item.productId, 'product');
          this.validateObjectId(item.variantId, 'variant');

          const existingItem: any = await this.redisService.hget(
            cartKey,
            item.variantId,
          );
          const newQuantity = (existingItem?.quantity || 0) + item.quantity;

          if (newQuantity > 0) {
            const newItem = {
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              price: item.price,
              image: item.image,
              quantity: newQuantity,
              updatedAt: new Date().toISOString(),
            };
            await this.redisService.hset(cartKey, item.variantId, newItem);
          }
        } catch (itemError) {
          this.logger.warn(
            `Skipping invalid item in sync for user ${userId}: ${itemError.message}`,
          );
        }
      }

      this.logger.log(
        `Cart synced for user ${userId} with ${items.length} items`,
      );
      return this.getCart(userId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to sync cart for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to sync cart data');
    }
  }
}
