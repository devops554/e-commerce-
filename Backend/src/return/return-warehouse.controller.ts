import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ReturnService } from './return.service';
import { QcResultDto, ApproveReturnDto, RejectReturnDto, AssignPartnerDto } from './dto';
import { ReturnRequestStatus } from 'src/orders/schemas/return-enums';

@Controller('warehouse/returns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
export class ReturnWarehouseController {
  constructor(private readonly returnService: ReturnService) { }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    return this.returnService.getReturns(undefined, { ...query, managerId: req.user._id });
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.returnService.getManagerStats(req.user._id);
  }

  @Get('analytics')
  async getWarehouseAnalytics(
    @Req() req: any,
    @Query('range') range: '7d' | '1m' | '1y' | 'all',
  ) {
    const warehouseId = await this.returnService.getManagerWarehouseId(req.user._id);
    return this.returnService.getManagerReturnStats(warehouseId.toString(), range);
  }

  @Post(':id/send-manager-otp')
  async sendOtp(@Req() req: any, @Param('id') id: string) {
    return this.returnService.sendManagerOtp(req.user._id, id);
  }

  @Patch(':id/approve')
  async approveReturn(@Req() req: any, @Param('id') id: string, @Body() dto: ApproveReturnDto) {
    const returnRequest = await this.returnService.verifyManagerAccess(req.user._id, id);
    if (returnRequest.status !== ReturnRequestStatus.PENDING) {
      throw new BadRequestException('Only PENDING returns can be approved by managers');
    }
    const res = await this.returnService.approveReturn(req.user._id, id, dto);
    return this.returnService.formatForApi(res);
  }

  @Patch(':id/reject')
  async rejectReturn(@Req() req: any, @Param('id') id: string, @Body() dto: RejectReturnDto) {
    const returnRequest = await this.returnService.verifyManagerAccess(req.user._id, id);
    if (returnRequest.status !== ReturnRequestStatus.PENDING) {
      throw new BadRequestException('Only PENDING returns can be rejected by managers');
    }
    const res = await this.returnService.rejectReturn(req.user._id, id, dto);
    return this.returnService.formatForApi(res);
  }

  @Patch(':id/assign-partner')
  async assignPartner(@Req() req: any, @Param('id') id: string, @Body() dto: AssignPartnerDto) {
    await this.returnService.verifyManagerAccess(req.user._id, id);
    return this.returnService.assignPartner(id, dto.deliveryPartnerId);
  }

  @Patch(':id/resolve-failed-pickup')
  async resolveFailedPickup(@Req() req: any, @Param('id') id: string, @Body() dto: ApproveReturnDto & { approved: boolean, rejectionReason?: string }) {
    await this.returnService.verifyManagerAccess(req.user._id, id);
    const res = await this.returnService.resolveFailedPickup(id, dto);
    return this.returnService.formatForApi(res);
  }

  @Patch(':id/qc')
  async updateQc(@Req() req: any, @Param('id') id: string, @Body() dto: QcResultDto) {
    await this.returnService.verifyManagerAccess(req.user._id, id);
    const res = await this.returnService.updateQc(req.user._id, id, dto);
    return this.returnService.formatForApi(res);
  }
}
