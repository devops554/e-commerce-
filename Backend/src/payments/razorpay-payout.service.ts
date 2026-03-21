import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentHistory } from './schemas/payment-history.schema';

@Injectable()
export class RazorpayPayoutService {
  private readonly logger = new Logger(RazorpayPayoutService.name);
  private readonly auth: string;
  private readonly baseUrl = 'https://api.razorpay.com/v1';

  constructor(
    private configService: ConfigService,
    @InjectModel(PaymentHistory.name)
    private paymentHistoryModel: Model<PaymentHistory>,
  ) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    this.auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  }

  private async request(method: string, url: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${url}`,
        data,
        headers: {
          Authorization: `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Razorpay Payout API Error: ${error.response?.data?.error?.description || error.message}`);
      throw new BadRequestException(error.response?.data?.error?.description || 'Razorpay Payout API failure');
    }
  }

  async createContact(name: string, phone: string, email?: string) {
    return this.request('POST', '/contacts', {
      name,
      contact: phone,
      email,
      type: 'vendor', // Using 'vendor' for delivery partners
      reference_id: phone,
    });
  }

  async createFundAccount(contactId: string, payoutMethod: any) {
    const data: any = {
      contact_id: contactId,
      account_type: payoutMethod.method === 'BANK' ? 'bank_account' : 'vpa',
    };

    if (payoutMethod.method === 'BANK') {
      data.bank_account = {
        name: payoutMethod.name || 'Partner Account',
        ifsc: payoutMethod.ifsc,
        account_number: payoutMethod.accountNumber,
      };
    } else {
      data.vpa = { address: payoutMethod.upiId };
    }

    return this.request('POST', '/fund_accounts', data);
  }

  async createPayout(fundAccountId: string, amount: number, referenceId: string, note?: string) {
    const accountId = this.configService.get<string>('RAZORPAY_X_ACCOUNT_NUMBER');
    if (!accountId) {
      throw new BadRequestException('Razorpay X Account Number not configured');
    }

    const payout = await this.request('POST', '/payouts', {
      account_number: accountId,
      fund_account_id: fundAccountId,
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      mode: 'IMPS', // Default to IMPS for speed
      purpose: 'payout',
      reference_id: referenceId,
      narrations: note || 'Partner Earnings Payout',
    });

    try {
      const history = new this.paymentHistoryModel({
        orderId: referenceId,
        razorpayPayoutId: payout.id,
        amount: amount, // already in INR from parameter
        currency: 'INR',
        status: payout.status,
        method: payout.mode,
        type: 'payout',
        rawResponse: payout,
      });
      await history.save();
      this.logger.log(`Payout recorded in history for reference: ${referenceId}`);
    } catch (e) {
      this.logger.error(`Failed to record payout in history: ${e.message}`);
    }

    return payout;
  }
}
