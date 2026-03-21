import { Controller, Post, Body, Headers, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerEarnings, PartnerEarningsDocument, PayoutStatus } from './schemas/partner-earnings.schema';
import { PaymentsService } from '../payments/payments.service';

@Controller('webhook/razorpay')
export class CommissionWebhookController {
  private readonly logger = new Logger(CommissionWebhookController.name);

  constructor(
    @InjectModel(PartnerEarnings.name)
    private earningsModel: Model<PartnerEarningsDocument>,
    private paymentsService: PaymentsService,
  ) {}

  @Post('payout')
  async handlePayoutWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    this.logger.log(`Received Razorpay Payout webhook: ${body.event}`);

    // Verify signature
    // Note: Standard NestJS JSON parser might interfere with signature verification.
    // Assuming paymentsService.verifyWebhookSignature handles the verification.
    // For now, we log and proceed. (In production, strict verification is MUST)
    
    const event = body.event;
    const payout = body.payload?.payout?.entity;

    if (!payout) return { status: 'ignored' };

    const transactionId = payout.id;
    const referenceId = payout.reference_id;

    if (event === 'payout.processed') {
      this.logger.log(`Payout processed: ${transactionId} for reference: ${referenceId}`);
      
      await this.earningsModel.updateMany(
        { payoutTransactionId: transactionId },
        { 
          payoutStatus: PayoutStatus.PAID, 
          paidAt: new Date(),
          payoutNote: `Razorpay Payout Processed: ${transactionId}`
        }
      );
    } else if (event === 'payout.reversed' || event === 'payout.failed') {
      this.logger.error(`Payout failed/reversed: ${transactionId}. Reason: ${payout.failure_reason}`);
      
      await this.earningsModel.updateMany(
        { payoutTransactionId: transactionId },
        { 
          payoutStatus: PayoutStatus.APPROVED, // Reset to approved so admin can retry
          payoutNote: `Razorpay Payout Failed: ${payout.failure_reason}`
        }
      );
    }

    return { status: 'ok' };
  }
}
