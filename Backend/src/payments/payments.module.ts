import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RazorpayPayoutService } from './razorpay-payout.service';
import {
  PaymentHistory,
  PaymentHistorySchema,
} from './schemas/payment-history.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: PaymentHistory.name, schema: PaymentHistorySchema },
    ]),
  ],
  providers: [PaymentsService, RazorpayPayoutService],
  controllers: [PaymentsController],
  exports: [PaymentsService, RazorpayPayoutService],
})
export class PaymentsModule { }
