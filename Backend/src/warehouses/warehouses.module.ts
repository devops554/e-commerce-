import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { Warehouse, WarehouseSchema } from './schemas/warehouse.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import {
  StockHistory,
  StockHistorySchema,
} from './schemas/stock-history.schema';
import { InventoryService } from './inventory.service';
import InventoryController from './inventory.controller';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Product, ProductSchema } from 'src/products/schemas/product.schema';
import {
  Category,
  CategorySchema,
} from 'src/categories/schemas/category.schema';
import {
  ProductType,
  ProductTypeSchema,
} from 'src/product-types/schemas/product-type.schema';
import { Seller, SellerSchema } from 'src/sellers/schemas/seller.schema';
import { EventsModule } from 'src/events/events.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Warehouse.name, schema: WarehouseSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: StockHistory.name, schema: StockHistorySchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: ProductType.name, schema: ProductTypeSchema },
      { name: Seller.name, schema: SellerSchema },
    ]),
    UsersModule,
    ProductsModule,
    EventsModule,
    NotificationsModule,
  ],
  controllers: [WarehousesController, InventoryController],
  providers: [WarehousesService, InventoryService],
  exports: [WarehousesService, InventoryService],
})
export class WarehousesModule {}
