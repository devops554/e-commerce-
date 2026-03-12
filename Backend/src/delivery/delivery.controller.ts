import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
  Query,
  NotFoundException,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DeliveryPartnerJwtGuard } from '../delivery-partners/delivery-partner.guard';
import { ShipmentsService } from '../shipments/shipments.service';
import { DeliveryPartnersService } from '../delivery-partners/delivery-partners.service';
import { ShipmentStatus } from '../shipments/schemas/shipment.schema';

@Controller('delivery')
@UseGuards(DeliveryPartnerJwtGuard)
export class DeliveryController {
  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly partnersService: DeliveryPartnersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── PROFILE & AVAILABILITY ───

  @Get('profile')
  async getProfile(@Req() req: any) {
    return req.deliveryPartner;
  }

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() dto: any) {
    return this.partnersService.update(req.deliveryPartner._id, dto);
  }

  @Patch('availability')
  async updateAvailability(@Req() req: any, @Body('status') status: any) {
    return this.partnersService.update(req.deliveryPartner._id, {
      availabilityStatus: status,
    });
  }

  @Post('location/update')
  async updateLocation(@Req() req: any, @Body() dto: any) {
    return this.partnersService.updateLocation(req.deliveryPartner._id, dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    console.log('Received file upload request:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
    });
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const result = await this.cloudinaryService.uploadFile(
      file,
      'delivery-partners',
    );
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  @Get('dashboard/stats')
  async getStats(@Req() req: any) {
    const partnerId = req.deliveryPartner._id.toString();
    return this.shipmentsService.getPartnerStats(partnerId);
  }

  // ─── ORDERS / SHIPMENTS ───

  @Get('orders/available')
  async getAvailableOrders(@Req() req: any) {
    const partnerId = req.deliveryPartner._id.toString();
    const shipments = await this.shipmentsService.findAll({
      deliveryPartnerId: partnerId,
      status: ShipmentStatus.ASSIGNED_TO_DELIVERY,
    });
    return shipments.data;
  }

  @Get('orders/active')
  async getActiveOrder(@Req() req: any) {
    const partnerId = req.deliveryPartner._id.toString();
    // Return all shipments that are currently "in progress" for this partner
    const shipments = await this.shipmentsService.findAll({
      deliveryPartnerId: partnerId,
      status: {
        $in: [
          ShipmentStatus.ACCEPTED,
          ShipmentStatus.PICKED_UP,
          ShipmentStatus.OUT_FOR_DELIVERY,
        ],
      } as any,
    });
    return shipments.data; // Now returning Array of Shipments
  }

  @Get('shipments/:id')
  async getShipmentById(@Req() req: any, @Param('id') id: string) {
    const partnerId = req.deliveryPartner._id.toString();
    const shipment = await this.shipmentsService.findById(id);

    // Verify ownership
    const sPartnerId =
      shipment.deliveryPartnerId?._id?.toString() ||
      shipment.deliveryPartnerId?.toString();

    if (sPartnerId !== partnerId) {
      throw new NotFoundException('Shipment not assigned to you');
    }

    return shipment;
  }

  @Post('orders/accept')
  async acceptOrder(
    @Req() req: any,
    @Body('orderId') orderId?: string,
    @Body('shipmentId') shipmentId?: string,
  ) {
    const partnerId = req.deliveryPartner._id.toString();
    console.log(
      `[DELIVERY] Accept Order attempt - Partner: ${partnerId}, Order: ${orderId}, Shipment: ${shipmentId}`,
    );

    let shipment;

    if (shipmentId) {
      shipment = await this.shipmentsService.findById(shipmentId);
      const sPartnerId =
        shipment.deliveryPartnerId?._id?.toString() ||
        shipment.deliveryPartnerId?.toString();
      if (sPartnerId !== partnerId) {
        console.error(
          `[DELIVERY] Accept Order failed: Shipment ${shipmentId} assigned to ${sPartnerId}, not ${partnerId}`,
        );
        throw new NotFoundException('Shipment not assigned to you');
      }
    } else if (orderId) {
      shipment = await this.findShipmentByOrder(orderId, partnerId);
    } else {
      throw new BadRequestException('Order ID or Shipment ID is required');
    }

    // Move status to OUT_FOR_DELIVERY upon acceptance so it shows in Active screen
    return this.shipmentsService.updateStatus(shipment._id.toString(), {
      status: ShipmentStatus.OUT_FOR_DELIVERY,
    });
  }

  @Post('orders/reject')
  async rejectOrder(
    @Req() req: any,
    @Body('orderId') orderId?: string,
    @Body('shipmentId') shipmentId?: string,
  ) {
    const partnerId = req.deliveryPartner._id.toString();
    console.log(
      `[DELIVERY] Reject Order attempt - Partner: ${partnerId}, Order: ${orderId}, Shipment: ${shipmentId}`,
    );

    let shipment;

    if (shipmentId) {
      shipment = await this.shipmentsService.findById(shipmentId);
      const sPartnerId =
        shipment.deliveryPartnerId?._id?.toString() ||
        shipment.deliveryPartnerId?.toString();
      if (sPartnerId !== partnerId) {
        throw new NotFoundException('Shipment not assigned to you');
      }
    } else if (orderId) {
      shipment = await this.findShipmentByOrder(orderId, partnerId);
    } else {
      throw new BadRequestException('Order ID or Shipment ID is required');
    }

    return this.shipmentsService.cancelShipment(
      shipment._id.toString(),
      'Rejected by partner',
    );
  }

  @Post('orders/start')
  async startDelivery(@Req() req: any, @Body('orderId') orderId: string) {
    const partnerId = req.deliveryPartner._id.toString();
    const shipment = await this.findShipmentByOrder(orderId, partnerId);
    return this.shipmentsService.updateStatus(shipment._id.toString(), {
      status: ShipmentStatus.OUT_FOR_DELIVERY,
    });
  }

  @Post('orders/complete')
  async completeDelivery(@Req() req: any, @Body('orderId') orderId: string) {
    const partnerId = req.deliveryPartner._id.toString();
    const shipment = await this.findShipmentByOrder(orderId, partnerId);
    return this.shipmentsService.updateStatus(shipment._id.toString(), {
      status: ShipmentStatus.DELIVERED,
    });
  }

  @Post('orders/fail')
  async failDelivery(
    @Req() req: any,
    @Body('orderId') orderId: string,
    @Body('reason') reason: string,
  ) {
    const partnerId = req.deliveryPartner._id.toString();
    const shipment = await this.findShipmentByOrder(orderId, partnerId);
    return this.shipmentsService.updateStatus(shipment._id.toString(), {
      status: ShipmentStatus.FAILED_DELIVERY,
    });
  }

  @Get('orders/history')
  async getOrderHistory(@Req() req: any, @Query('filter') filter: string) {
    const partnerId = req.deliveryPartner._id.toString();
    const shipments = await this.shipmentsService.findAll({
      deliveryPartnerId: partnerId,
      status: ShipmentStatus.DELIVERED, // Simplified
    });
    return shipments.data.map((s) => s.orderId);
  }

  @Get('orders/:id')
  async getOrderById(@Req() req: any, @Param('id') id: string) {
    // 'id' here is orderId
    const partnerId = req.deliveryPartner._id.toString();
    const shipment = await this.findShipmentByOrder(id, partnerId);
    return shipment.orderId;
  }

  private async findShipmentByOrder(orderId: string, partnerId: string) {
    // Query more efficiently by passing orderId to findAll (or ideally add a findOne to service)
    const shipmentRes = await this.shipmentsService.findAll({
      deliveryPartnerId: partnerId,
      orderId: orderId,
    });

    const shipment = shipmentRes.data[0];
    if (!shipment) {
      console.error(
        `[DELIVERY] Shipment lookup failed for Order: ${orderId}, Partner: ${partnerId}`,
      );
      throw new NotFoundException('Shipment for this order not found');
    }
    return shipment;
  }
}
