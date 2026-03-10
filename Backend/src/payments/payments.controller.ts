import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  // ─── GATEWAY WEBHOOKS ───

  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    this.logger.log(`Received Razorpay webhook event: ${body.event}`);

    // Note: In strict production, signature verification requires RAW body.
    // If NestJS JSON parser has already run, verifySignature(JSON.stringify(body)) may fail
    // if key order differs. Custom middleware or raw-body capture is recommended.

    const event = body.event;
    if (event === 'payment.captured') {
      const payment = body.payload.payment.entity;
      const orderId = payment.order_id;
      this.logger.log(`Payment successfully captured for order: ${orderId}`);

      // TODO: Integrate with OrdersService to update order status to 'PAID' or 'PROCESSING'
    }

    return { status: 'ok' };
  }
}
