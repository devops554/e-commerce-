import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryRateConfig, DeliveryRateConfigSchema } from './schemas/delivery-rate-config.schema';
import { DeliverySurgeRule, DeliverySurgeRuleSchema } from './schemas/delivery-surge-rule.schema';
import { DeliveryZone, DeliveryZoneSchema } from './schemas/delivery-zone.schema';
import { PartnerOffer, PartnerOfferSchema } from './schemas/partner-offer.schema';
import { PartnerEarnings, PartnerEarningsSchema } from './schemas/partner-earnings.schema';
import { CommissionConfig, CommissionConfigSchema } from './schemas/commission-config.schema';
import { Shipment, ShipmentSchema } from '../shipments/schemas/shipment.schema';
import { CommissionCalculatorService } from './commission-calculator.service';
import { CommissionAdminController } from './commission-admin.controller';
import { CommissionDeliveryController } from './commission-delivery.controller';
import { CommissionWebhookController } from './commission-webhook.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { DeliveryPartnersModule } from '../delivery-partners/delivery-partners.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryRateConfig.name, schema: DeliveryRateConfigSchema },
      { name: DeliverySurgeRule.name, schema: DeliverySurgeRuleSchema },
      { name: DeliveryZone.name, schema: DeliveryZoneSchema },
      { name: PartnerOffer.name, schema: PartnerOfferSchema },
      { name: PartnerEarnings.name, schema: PartnerEarningsSchema },
      { name: CommissionConfig.name, schema: CommissionConfigSchema },
      { name: Shipment.name, schema: ShipmentSchema },
    ]),
    forwardRef(() => NotificationsModule),
    PaymentsModule,
    forwardRef(() => DeliveryPartnersModule),
  ],
  providers: [CommissionCalculatorService],
  controllers: [
    CommissionAdminController,
    CommissionDeliveryController,
    CommissionWebhookController
  ],
  exports: [CommissionCalculatorService],
})
export class DeliveryCommissionModule { }
