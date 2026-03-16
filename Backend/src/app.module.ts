import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { DeliveryModule } from './delivery/delivery.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { DeliveryPartnersModule } from './delivery-partners/delivery-partners.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { SellersModule } from './sellers/sellers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventsModule } from './events/events.module';
import { BannerModule } from './banner/banner.module';
import { RedisModule } from './redis/redis.module';
import { SettingsModule } from './settings/settings.module';

import { ReturnsModule } from './returns/returns.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductTypesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    CloudinaryModule,
    RedisModule,
    CategoriesModule,
    BannerModule,
    EventsModule,
    NotificationsModule,
    SellersModule,
    WarehousesModule,
    DeliveryPartnersModule,
    ShipmentsModule,
    DeliveryModule,
    SettingsModule,
    ReturnsModule,
    ReviewsModule,
  ],
})
export class AppModule {}
