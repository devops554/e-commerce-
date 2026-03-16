import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      this.logger.error(
        'Razorpay gateway credentials (ID or SECRET) are missing from configuration',
      );
    }

    this.razorpay = new Razorpay({
      key_id: keyId || '',
      key_secret: keySecret || '',
    });
  }

  // ─── ORDER CREATION ───

  async createRazorpayOrder(amount: number, receipt: string) {
    try {
      if (amount <= 0) {
        throw new BadRequestException('Order amount must be greater than 0');
      }

      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt,
        payment_capture: 1,
      };

      const order = await this.razorpay.orders.create(options);
      this.logger.log(
        `Razorpay order created: ${order.id} for receipt: ${receipt}`,
      );
      return order;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Razorpay order creation failed for receipt ${receipt}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Payment gateway error. Please try again later.',
      );
    }
  }

  // ─── SIGNATURE VERIFICATION ───

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    try {
      const body = orderId + '|' + paymentId;
      const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

      if (!secret) {
        this.logger.error(
          'Razorpay key secret missing during signature verification',
        );
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === signature;
      if (!isValid) {
        this.logger.warn(`Invalid Razorpay signature for order: ${orderId}`);
      }
      return isValid;
    } catch (error) {
      this.logger.error(
        `Razorpay signature verification encountered an error: ${error.message}`,
      );
      return false;
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
      if (!secret) {
        this.logger.error(
          'Razorpay webhook secret missing during verification',
        );
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === signature;
      if (!isValid) {
        this.logger.warn('Invalid Razorpay webhook signature detected');
      }
      return isValid;
    } catch (error) {
      this.logger.error(
        `Razorpay webhook verification encountered an error: ${error.message}`,
      );
      return false;
    }
  }

  async createRefund(paymentId: string, amount: number, notes?: any) {
    try {
      const options: any = {
        payment_id: paymentId,
        amount: Math.round(amount * 100), // paise
      };
      if (notes) options.notes = notes;

      const refund = await this.razorpay.payments.refund(paymentId, options);
      this.logger.log(`Razorpay refund created: ${refund.id} for payment: ${paymentId}`);
      return refund;
    } catch (error) {
      this.logger.error(
        `Razorpay refund failed for payment ${paymentId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Refund failed at payment gateway');
    }
  }
}
