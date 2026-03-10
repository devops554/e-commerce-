import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { ShipmentsModule } from '../shipments/shipments.module';
import { DeliveryPartnersModule } from '../delivery-partners/delivery-partners.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [ShipmentsModule, DeliveryPartnersModule, CloudinaryModule],
  controllers: [DeliveryController],
})
export class DeliveryModule {}
