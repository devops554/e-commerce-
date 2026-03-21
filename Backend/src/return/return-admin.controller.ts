import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ReturnService } from './return.service';
import { ApproveReturnDto, RejectReturnDto, AssignPartnerDto, RefundDto } from './dto';

@Controller('admin/returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnAdminController {
  constructor(private readonly returnService: ReturnService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async findAll(@Query() query: any) {
    return this.returnService.getReturns(query.customerId, query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async getStats() {
    return this.returnService.getStats();
  }

  @Get('analytics/global')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async getGlobalAnalytics(
    @Query('range') range: '7d' | '1m' | '1y' | 'all',
  ) {
    return this.returnService.getGlobalReturnStats(range);
  }

  @Get('finance-report')
  @Roles(UserRole.ADMIN)
  async getFinanceReport() {
    return this.returnService.getFinanceReport();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async findOne(@Param('id') id: string) {
    return this.returnService.getReturnById(id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async approve(@Req() req: any, @Param('id') id: string, @Body() dto: ApproveReturnDto) {
    return this.returnService.approveReturn(req.user._id, id, dto);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async reject(@Req() req: any, @Param('id') id: string, @Body() dto: RejectReturnDto) {
    return this.returnService.rejectReturn(req.user._id, id, dto);
  }

  @Post(':id/assign-partner')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async assignPartner(@Param('id') id: string, @Body() dto: AssignPartnerDto) {
    return this.returnService.assignPartner(id, dto.deliveryPartnerId);
  }

  @Patch(':id/refund')
  @Roles(UserRole.ADMIN)
  async refund(@Req() req: any, @Param('id') id: string, @Body() dto: RefundDto) {
    return this.returnService.initiateRefund(req.user._id, id, dto);
  }

  @Patch(':id/force-close')
  @Roles(UserRole.ADMIN)
  async forceClose(@Req() req: any, @Param('id') id: string, @Body() dto: { reason: string }) {
    return this.returnService.forceCloseReturn(req.user._id, id, dto.reason);
  }
}
