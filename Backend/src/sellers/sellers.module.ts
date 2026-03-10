import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { Seller, SellerSchema } from './schemas/seller.schema';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Seller.name, schema: SellerSchema }]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService, MongooseModule],
})
export class SellersModule {}
