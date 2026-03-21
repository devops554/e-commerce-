import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReturnRequestsController } from './return-requests.controller';
import { ReturnRequestsService } from './return-requests.service';
import { Product, ProductSchema, ProductVariant, ProductVariantSchema } from '../products/schemas/product.schema';
import { ReturnRequest, ReturnRequestSchema } from '../orders/schemas/return-request.schema';
import { OrdersModule } from '../orders/orders.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
    forwardRef(() => OrdersModule),
    ShipmentsModule,
    WarehousesModule,
    NotificationsModule,
    PaymentsModule,
    UsersModule,
  ],
  controllers: [ReturnRequestsController],
  providers: [ReturnRequestsService],
  exports: [ReturnRequestsService],
})
export class ReturnsModule { }
