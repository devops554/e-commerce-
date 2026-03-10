import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { BannerService } from './banner.service';
import {
  BannerAdminController,
  BannerPublicController,
} from './banner.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
    AuthModule,
    UsersModule,
  ],
  controllers: [BannerPublicController, BannerAdminController],

  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}
