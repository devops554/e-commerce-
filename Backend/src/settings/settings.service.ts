import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StoreConfig,
  StoreConfigDocument,
} from './schemas/store-config.schema';
import { sellerConfig } from '../config/seller.config';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);
  private readonly CONFIG_KEY = 'GlobalConfig';

  constructor(
    @InjectModel(StoreConfig.name)
    private storeConfigModel: Model<StoreConfigDocument>,
  ) {}

  async onModuleInit() {
    await this.initializeConfig();
  }

  private async initializeConfig() {
    const config = await this.storeConfigModel.findOne({
      configKey: this.CONFIG_KEY,
    });
    if (!config) {
      this.logger.log('Initializing StoreConfig from environment variables...');
      await this.storeConfigModel.create({
        configKey: this.CONFIG_KEY,
        legalName: sellerConfig.legalName || 'Bivha Edusolution',
        gstin: sellerConfig.gstin || '',
        stateCode: sellerConfig.stateCode || '',
        address: sellerConfig.address || '',
        email: sellerConfig.email || '',
        phone: sellerConfig.phone || '',
      });
    }
  }

  async getConfig(): Promise<StoreConfigDocument | null> {
    return this.storeConfigModel.findOne({ configKey: this.CONFIG_KEY }).exec();
  }

  async updateConfig(
    data: Partial<StoreConfig>,
  ): Promise<StoreConfigDocument | null> {
    return this.storeConfigModel
      .findOneAndUpdate(
        { configKey: this.CONFIG_KEY },
        { $set: data },
        { new: true },
      )
      .exec();
  }
}
