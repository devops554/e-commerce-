import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import {
  Product,
  ProductSchema,
  ProductVariant,
  ProductVariantSchema,
} from '../products/schemas/product.schema';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductsModule } from '../products/products.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { SellersModule } from 'src/sellers/sellers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
    PaymentsModule,
    UsersModule,
    NotificationsModule,
    ProductsModule,
    WarehousesModule,
    ShipmentsModule,
    SellersModule,
  ],

  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
