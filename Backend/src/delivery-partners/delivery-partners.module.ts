import { Module, forwardRef } from '@nestjs/common';
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
import { PaymentsModule } from '../payments/payments.module';
import { PartnerEarnings, PartnerEarningsSchema } from '../delivery-commission/schemas/partner-earnings.schema';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => NotificationsModule),
    PassportModule,
    ConfigModule,
    PaymentsModule,
    MongooseModule.forFeature([
      { name: DeliveryPartner.name, schema: DeliveryPartnerSchema },
      { name: Shipment.name, schema: ShipmentSchema },
      { name: PartnerEarnings.name, schema: PartnerEarningsSchema },
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
export class DeliveryPartnersModule { }
