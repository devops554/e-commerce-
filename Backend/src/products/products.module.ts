import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import {
  Product,
  ProductSchema,
  ProductVariant,
  ProductVariantSchema,
} from './schemas/product.schema';
import {
  Inventory,
  InventorySchema,
} from '../warehouses/schemas/inventory.schema';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../categories/categories.module';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Inventory.name, schema: InventorySchema },
    ]),
    UsersModule,
    CategoriesModule,
    SellersModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, MongooseModule],
})
export class ProductsModule {}
