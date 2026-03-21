import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ReturnService } from './return.service';
import { VerifyPickupDto } from './dto';
import { DeliveryPartnerJwtGuard } from '../delivery-partners/delivery-partner.guard';

@Controller('delivery/returns')
@UseGuards(DeliveryPartnerJwtGuard)
export class ReturnDeliveryController {
  constructor(private readonly returnService: ReturnService) { }

  @Get('assigned')
  async getAssigned(@Req() req: any) {
    return this.returnService.getReturns(undefined, { assignedPartnerId: req.deliveryPartner._id, activeOnly: true });
  }

  @Patch(':id/accept')
  async accept(@Req() req: any, @Param('id') id: string) {
    return this.returnService.acceptPickup(req.deliveryPartner._id, id);
  }

  @Patch(':id/reject')
  async reject(@Req() req: any, @Param('id') id: string, @Body() dto: { rejectionReason: string }) {
    return this.returnService.rejectPickup(req.deliveryPartner._id, id, dto);
  }

  @Patch(':id/verify-items')
  async verifyItems(@Req() req: any, @Param('id') id: string, @Body() dto: VerifyPickupDto) {
    return this.returnService.verifyPickupItems(req.deliveryPartner._id, id, dto);
  }

  @Post(':id/verify-customer-otp')
  async verifyCustomerOtp(@Req() req: any, @Param('id') id: string, @Body('otp') otp: string) {
    return this.returnService.verifyCustomerOtp(req.deliveryPartner._id, id, otp);
  }

  /**
   * Delivery partner calls this when they arrive at the warehouse.
   * Generates a managerOtp and sends it to the warehouse manager.
   * The manager then shares this OTP back to the DP for verification.
   */
  @Post(':id/send-manager-otp')
  async sendManagerOtp(@Req() req: any, @Param('id') id: string) {
    return this.returnService.sendManagerOtpByDP(req.deliveryPartner._id, id);
  }

  @Post(':id/verify-manager-otp')
  async verifyManagerOtp(@Req() req: any, @Param('id') id: string, @Body('otp') otp: string) {
    return this.returnService.verifyManagerOtp(req.deliveryPartner._id, id, otp);
  }

  @Get('history')
  async getHistory(@Req() req: any, @Query() query: any) {
    return this.returnService.getReturns(undefined, { assignedPartnerId: req.deliveryPartner._id, historyOnly: true, ...query });
  }
}
