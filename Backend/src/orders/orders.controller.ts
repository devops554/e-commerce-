import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  Delete,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { OrderStatus } from './schemas/order.schema';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) { }

  // ─── CUSTOMER ROUTES ───

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createOrderDto: CreateOrderOrderDto, @Req() req: any) {
    const userId = req.user._id.toString();
    this.logger.log(`Creating order for user: ${userId}`);
    return this.ordersService.createOrder(createOrderDto, userId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyOrders(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user._id.toString();
    const p = page ? parseInt(page) : 1;
    const l = limit ? parseInt(limit) : 10;
    return this.ordersService.getMyOrders(userId, p, l);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  verifyPayment(
    @Body('razorpay_order_id') orderId: string,
    @Body('razorpay_payment_id') paymentId: string,
    @Body('razorpay_signature') signature: string,
  ) {
    this.logger.log(`Verifying payment for order ID: ${orderId}`);
    return this.ordersService.verifyPayment(orderId, paymentId, signature);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelOrder(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUB_ADMIN].includes(
      req.user.role,
    );
    if (!isAdmin && req.user.role !== UserRole.CUSTOMER && req.user.role !== UserRole.MANAGER) {
      throw new UnauthorizedException('Access denied');
    }

    // For security, if not admin, we pass userId to check ownership in service
    this.logger.warn(
      `User ${req.user._id} requested cancellation for order: ${id}`,
    );
    return this.ordersService.cancelOrder(
      id,
      req.user._id,
      req.user.role,
      reason,
      isAdmin ? 'admin' : 'customer',
    );
  }

  @Post(':id/cancel-item')
  @UseGuards(JwtAuthGuard)
  cancelOrderItem(
    @Param('id') id: string,
    @Body('variantId') variantId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUB_ADMIN].includes(
      req.user.role,
    );
    this.logger.warn(
      `User ${req.user._id} requested cancellation for item ${variantId} in order: ${id}`,
    );
    return this.ordersService.cancelOrderItem(
      id,
      variantId,
      req.user._id,
      req.user.role,
      reason,
      isAdmin ? 'admin' : 'customer',
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard)
  getInvoice(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.getInvoice(
      id,
      req.user._id.toString(),
      req.user.role,
    );
  }

  @Get(':id/packing-slip')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  getPackingSlip(@Param('id') id: string) {
    return this.ordersService.getPackingSlip(id);
  }

  // ─── ADMIN ROUTES ───

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('userId') userId?: string,
  ) {
    const p = page ? parseInt(page) : 1;
    const l = limit ? parseInt(limit) : 20;

    if (p < 1) throw new BadRequestException('Page must be greater than 0');
    if (l < 1 || l > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    return this.ordersService.getAllOrders({
      page: p,
      limit: l,
      status,
      search,
      userId,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Req() req: any,
  ) {
    this.logger.log(`Admin updating status of order ${id} to ${status}`);
    return this.ordersService.updateOrderStatus(
      id,
      status,
      req.user._id,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  deleteOrder(@Param('id') id: string) {
    this.logger.warn(`Admin deleting order: ${id}`);
    return this.ordersService.deleteOrder(id);
  }

  @Post(':id/reassign-warehouse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  reassignWarehouse(
    @Param('id') id: string,
    @Body('oldWarehouseId') oldWarehouseId: string,
    @Body('newWarehouseId') newWarehouseId: string,
    @Req() req: any,
  ) {
    return this.ordersService.reassignWarehouse(
      id,
      oldWarehouseId,
      newWarehouseId,
      req.user._id,
      req.user.role,
    );
  }

  // ─── WAREHOUSE MANAGER ROUTES ───

  @Get('warehouse/:warehouseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getWarehouseOrders(
    @Param('warehouseId') warehouseId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const p = page ? parseInt(page) : 1;
    const l = limit ? parseInt(limit) : 20;
    return this.ordersService.getWarehouseOrders(warehouseId, p, l, search);
  }

  @Post(':id/dispatch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  dispatchItem(
    @Param('id') id: string,
    @Body('variantId') variantId: string,
    @Body('warehouseId') warehouseId: string,
    @Req() req: any,
  ) {
    return this.ordersService.confirmOrderItemDispatch(
      id,
      variantId,
      warehouseId,
      req.user._id,
      req.user.role,
    );
  }

  @Post(':id/bulk-dispatch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  bulkDispatch(
    @Param('id') id: string,
    @Body('warehouseId') warehouseId: string,
    @Req() req: any,
  ) {
    return this.ordersService.confirmWarehouseAllItems(
      id,
      warehouseId,
      req.user._id,
      req.user.role,
    );
  }
}
