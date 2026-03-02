import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { UsersModule } from '../users/users.module';
import { ProductTypesModule } from '../product-types/product-types.module';
import { ProductType, ProductTypeSchema } from '../product-types/schemas/product-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: ProductType.name, schema: ProductTypeSchema }
    ]),
    UsersModule,
    ProductTypesModule,
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule { }
