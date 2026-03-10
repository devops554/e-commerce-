import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreConfig, StoreConfigSchema } from './schemas/store-config.schema';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { UsersModule } from 'src/users/users.module';
import { SellersModule } from 'src/sellers/sellers.module';
import { ProductsModule } from 'src/products/products.module';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { ShipmentsModule } from 'src/shipments/shipments.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreConfig.name, schema: StoreConfigSchema },
    ]),
    UsersModule,
    SellersModule,
    ProductsModule,
    WarehousesModule,
    ShipmentsModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
