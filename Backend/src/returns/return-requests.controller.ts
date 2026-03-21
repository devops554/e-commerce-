import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReturnRequestsService } from './return-requests.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RefundMethod } from '../products/schemas/product.schema';
import { ReturnRequestStatus, QcGrade } from '../orders/schemas/return-enums';
import { UserRole } from '../users/schemas/user.schema';

@Controller('return-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnRequestsController {
  constructor(
    private readonly returnsService: ReturnRequestsService,
    private readonly warehousesService: WarehousesService,
  ) { }

  @Post()
  @Roles(UserRole.CUSTOMER)
  async create(@Req() req: any, @Body() dto: any) {
    const res = await this.returnsService.create(req.user._id, dto);
    return this.returnsService.formatForApi(res);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER)
  async findAll(@Req() req: any, @Query() query: any) {
    if (req.user.role === UserRole.CUSTOMER) {
      return this.returnsService.findAll({ ...query, customerId: req.user._id });
    }
    if (req.user.role === UserRole.MANAGER) {
      const warehouse = await this.warehousesService.findByManager(req.user._id);
      if (!warehouse) {
        throw new NotFoundException('Warehouse not found for manager');
      }
      return this.returnsService.findAll({ ...query, warehouseId: warehouse._id });
    }
    // Admin — no restriction
    return this.returnsService.findAll(query);
  }


  @Get('my')
  @Roles(UserRole.CUSTOMER)
  async findMy(@Req() req: any, @Query() query: any) {
    return this.returnsService.findAll({ ...query, customerId: req.user._id });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.returnsService.findById(id);
    return this.returnsService.formatForApi(res);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async review(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: { approved: boolean; rejectionReason?: string; adminNote?: string },
  ) {
    if (req.user.role === UserRole.MANAGER) {
      const request = await this.returnsService.findById(id);
      const warehouse = await this.warehousesService.findByManager(req.user._id);
      if (!warehouse || warehouse._id.toString() !== request.warehouseId.toString()) {
        throw new BadRequestException('You can only review requests for your warehouse');
      }
    }
    const res = await this.returnsService.review(id, req.user._id, dto);
    return this.returnsService.formatForApi(res);
  }

  @Patch(':id/warehouse-qc')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateQc(
    @Param('id') id: string,
    @Body() dto: { warehouseQcGrade: QcGrade; warehouseQcNotes?: string },
  ) {
    const res = await this.returnsService.updateWarehouseQc(id, dto);
    return this.returnsService.formatForApi(res);
  }

  @Patch(':id/resolve-failed-pickup')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async resolveFailedPickup(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: { approved: boolean; rejectionReason?: string; adminNote?: string },
  ) {
    const res = await this.returnsService.resolveFailedPickup(id, req.user._id, dto);
    return this.returnsService.formatForApi(res);
  }

  @Patch(':id/refund')
  @Roles(UserRole.ADMIN)
  async initiateRefund(
    @Param('id') id: string,
    @Body() dto: { refundMethod: RefundMethod; refundAmount: number },
  ) {
    const res = await this.returnsService.initiateRefund(id, dto);
    return this.returnsService.formatForApi(res);
  }
}
