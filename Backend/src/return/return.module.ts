import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ReturnService } from './return.service';
import { ReturnController } from './return.controller';
import { ReturnAdminController } from './return-admin.controller';
import { ReturnWarehouseController } from './return-warehouse.controller';
import { ReturnDeliveryController } from './return-delivery.controller';

import { ReturnRequest, ReturnRequestSchema } from '../orders/schemas/return-request.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Shipment, ShipmentSchema } from '../shipments/schemas/shipment.schema';
import { DeliveryPartner, DeliveryPartnerSchema } from '../delivery-partners/schemas/delivery-partner.schema';
import { Inventory, InventorySchema } from '../warehouses/schemas/inventory.schema';
import { StockHistory, StockHistorySchema } from '../warehouses/schemas/stock-history.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';
import { Warehouse, WarehouseSchema } from '../warehouses/schemas/warehouse.schema';
import { ProductsModule } from 'src/products/products.module';
import { OrdersModule } from 'src/orders/orders.module';
import { ShipmentsModule } from 'src/shipments/shipments.module';
import { DeliveryPartnersModule } from 'src/delivery-partners/delivery-partners.module';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: ReturnRequest.name, schema: ReturnRequestSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Shipment.name, schema: ShipmentSchema },
      { name: 'DeliveryPartner', schema: DeliveryPartnerSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: StockHistory.name, schema: StockHistorySchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Warehouse.name, schema: WarehouseSchema },
    ]),
    ProductsModule,
    OrdersModule,
    ShipmentsModule,
    DeliveryPartnersModule,
    WarehousesModule,
    NotificationsModule,
    UsersModule,
    AuthModule,
    PaymentsModule,
  ],

  controllers: [
    ReturnController,
    ReturnAdminController,
    ReturnWarehouseController,
    ReturnDeliveryController,

  ],
  providers: [ReturnService],
  exports: [ReturnService],
})
export class ReturnModule { }
