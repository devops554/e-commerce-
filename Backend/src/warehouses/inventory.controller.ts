import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto, TransferStockDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export default class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('adjust')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async adjustStock(@Body() adjustStockDto: AdjustStockDto) {
    return this.inventoryService.adjustStock(adjustStockDto);
  }

  @Post('transfer')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async transferStock(@Body() transferStockDto: TransferStockDto) {
    return this.inventoryService.transferStock(transferStockDto);
  }

  @Get('warehouse/:id')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async getWarehouseInventory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.getWarehouseInventory({
      warehouseId: id,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
    });
  }

  @Get('warehouse/:id/history')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async getWarehouseHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('productId') productId?: string,
  ) {
    return this.inventoryService.getHistory({
      warehouseId: id,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      productId,
    });
  }

  @Get('warehouse/:id/history/stats')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async getWarehouseHistoryStats(
    @Param('id') id: string,
    @Query('range') range: string = '1m',
    @Query('productId') productId?: string,
  ) {
    return this.inventoryService.getHistoryStats({
      warehouseId: id,
      range,
      productId,
    });
  }

  // Manager receives stock into their own warehouse (warehouseId auto-resolved)
  @Post('manager/receive')
  @Roles(UserRole.MANAGER)
  async managerReceiveStock(
    @Req() req: any,
    @Body() body: { variantId: string; amount: number; source?: string },
  ) {
    return this.inventoryService.managerReceiveStock(
      req.user._id,
      body.variantId,
      body.amount,
      body.source,
    );
  }

  // Manager gets inventory for their own warehouse
  @Get('manager/my-warehouse')
  @Roles(UserRole.MANAGER)
  async getMyWarehouseInventory(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.getManagerWarehouseInventory({
      managerId: req.user._id,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
    });
  }
}
