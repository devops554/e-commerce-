import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
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
  async getWarehouseInventory(@Param('id') id: string) {
    return this.inventoryService.getWarehouseInventory(id);
  }

  @Get('warehouse/:id/history')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async getWarehouseHistory(@Param('id') id: string) {
    return this.inventoryService.getHistory(id);
  }

  // Manager receives stock into their own warehouse (warehouseId auto-resolved)
  @Post('manager/receive')
  @Roles(UserRole.MANAGER)
  async managerReceiveStock(
    @Req() req: any,
    @Body() body: { variantId: string; amount: number; source?: string },
  ) {
    return this.inventoryService.managerReceiveStock(
      req.user.id,
      body.variantId,
      body.amount,
      body.source,
    );
  }

  // Manager gets inventory for their own warehouse
  @Get('manager/my-warehouse')
  @Roles(UserRole.MANAGER)
  async getMyWarehouseInventory(@Req() req: any) {
    return this.inventoryService.getManagerWarehouseInventory(req.user.id);
  }
}
