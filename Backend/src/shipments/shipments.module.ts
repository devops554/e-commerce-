import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { Shipment, ShipmentSchema } from './schemas/shipment.schema';
import {
  TrackingHistory,
  TrackingHistorySchema,
} from './schemas/tracking-history.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { DeliveryPartnersModule } from '../delivery-partners/delivery-partners.module';
import { DeliveryPartnerJwtGuard } from '../delivery-partners/delivery-partner.guard';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import {
  DeliveryPartner,
  DeliveryPartnerSchema,
} from '../delivery-partners/schemas/delivery-partner.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ReturnRequest, ReturnRequestSchema } from '../orders/schemas/return-request.schema';
import { DeliveryCommissionModule } from '../delivery-commission/delivery-commission.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shipment.name, schema: ShipmentSchema },
      { name: TrackingHistory.name, schema: TrackingHistorySchema },
      { name: Order.name, schema: OrderSchema },
      { name: DeliveryPartner.name, schema: DeliveryPartnerSchema },
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
    ]),
    ConfigModule,
    UsersModule,
    forwardRef(() => DeliveryPartnersModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => WarehousesModule),
    forwardRef(() => DeliveryCommissionModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, DeliveryPartnerJwtGuard],
  exports: [ShipmentsService],
})
export class ShipmentsModule { }
