import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { DeliveryPartnersService } from './delivery-partners.service';
import { DeliveryPartnersController } from './delivery-partners.controller';
import {
  DeliveryPartner,
  DeliveryPartnerSchema,
} from './schemas/delivery-partner.schema';
import { DeliveryPartnerJwtGuard } from './delivery-partner.guard';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Shipment, ShipmentSchema } from '../shipments/schemas/shipment.schema';

@Module({
  imports: [
    UsersModule, // Required for RolesGuard to inject UsersService
    NotificationsModule, // ✅ Required for NotificationsService injection
    PassportModule,
    ConfigModule, // Added to make ConfigService available
    MongooseModule.forFeature([
      { name: DeliveryPartner.name, schema: DeliveryPartnerSchema },
      { name: Shipment.name, schema: ShipmentSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
            '7d') as any,
        },
      }),
    }),
  ],
  controllers: [DeliveryPartnersController],
  providers: [DeliveryPartnersService, DeliveryPartnerJwtGuard],
  exports: [
    DeliveryPartnersService,
    DeliveryPartnerJwtGuard,
    JwtModule,
    ConfigModule,
  ],
})
export class DeliveryPartnersModule {}
