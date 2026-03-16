import { Global, Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ShipmentsModule } from '../shipments/shipments.module';

@Global()
@Module({
  imports: [forwardRef(() => ShipmentsModule)],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
