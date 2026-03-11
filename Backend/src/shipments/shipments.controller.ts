import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import {
  AssignShipmentDto,
  CreateShipmentDto,
  UpdateShipmentStatusDto,
  UpdateTrackingLocationDto,
} from './dto/shipment.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { DeliveryPartnerJwtGuard } from '../delivery-partners/delivery-partner.guard';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) { }

  // ─── ADMIN & MANAGER ROUTES ───

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async create(@Body() createDto: CreateShipmentDto) {
    return this.shipmentsService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('warehouseId') warehouseId?: string,
    @Query('deliveryPartnerId') deliveryPartnerId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
  ) {
    return this.shipmentsService.findAll({
      page,
      limit,
      warehouseId,
      deliveryPartnerId,
      orderId,
      status,
    });
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async assignPartner(@Param('id') id: string, @Body() dto: AssignShipmentDto) {
    return this.shipmentsService.assignPartner(id, dto);
  }

  @Patch(':id/status/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async updateStatusAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateStatus(id, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async findOne(@Param('id') id: string) {
    return this.shipmentsService.findById(id);
  }

  // ─── DELIVERY PARTNER ROUTES ───

  @UseGuards(DeliveryPartnerJwtGuard)
  @Get('partner/my-shipments')
  async getMyShipments(
    @Req() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status?: string,
  ) {
    // Delivery partner ID from the request object attached by guard
    const partnerId = req.deliveryPartner._id.toString();
    return this.shipmentsService.findAll({
      page,
      limit,
      deliveryPartnerId: partnerId,
      status,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  @Patch(':id/cancel/admin')
  async cancelShipmentAdmin(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.shipmentsService.cancelShipment(id, reason);
  }

  @Post(':id/pickup-otp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async requestPickupOtp(@Param('id') id: string) {
    return this.shipmentsService.requestPickupOtp(id);
  }

  @Patch(':id/verify-pickup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async verifyPickupOtp(
    @Param('id') id: string,
    @Body() dto: { otp: string },
  ) {
    return this.shipmentsService.verifyPickupOtp(id, dto.otp);
  }

  @Post(':id/delivery-otp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async requestDeliveryOtp(@Param('id') id: string) {
    return this.shipmentsService.requestDeliveryOtp(id);
  }

  @Patch(':id/verify-delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async verifyDeliveryOtp(
    @Param('id') id: string,
    @Body() dto: { otp: string },
  ) {
    return this.shipmentsService.verifyDeliveryOtp(id, dto.otp);
  }

  // ─── DELIVERY PARTNER ROUTES ───

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch(':id/cancel')
  async cancelShipmentPartner(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    // In a real app, we'd verify the shipment belongs to this partner
    return this.shipmentsService.cancelShipment(id, reason);
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch(':id/status')
  async updateStatusPartner(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateStatus(id, dto);
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch(':id/accept')
  async acceptShipment(@Req() req: any, @Param('id') id: string) {
    return this.shipmentsService.acceptShipment(
      id,
      req.deliveryPartner._id.toString(),
    );
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch(':id/reject')
  async rejectShipment(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.shipmentsService.rejectShipment(
      id,
      req.deliveryPartner._id.toString(),
      reason,
    );
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch(':id/pickup')
  async pickupShipment(@Param('id') id: string) {
    return this.shipmentsService.pickupShipment(id);
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch(':id/start-delivery')
  async startDelivery(@Param('id') id: string) {
    return this.shipmentsService.startDelivery(id);
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch(':id/complete-delivery')
  async completeDelivery(@Param('id') id: string) {
    return this.shipmentsService.completeDelivery(id);
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Post(':id/tracking')
  async addTrackingLocation(
    @Param('id') id: string,
    @Body() dto: UpdateTrackingLocationDto,
  ) {
    return this.shipmentsService.addTrackingLocation(id, dto);
  }

  @Get(':id/tracking')
  async getTrackingHistory(@Param('id') id: string) {
    // This could be open or protected depending on business logic
    return this.shipmentsService.getTrackingHistory(id);
  }
}
