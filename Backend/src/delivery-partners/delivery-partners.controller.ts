import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { DeliveryPartnersService } from './delivery-partners.service';
import {
  LoginDeliveryPartnerDto,
  RegisterDeliveryPartnerDto,
  UpdateDeliveryPartnerDto,
  UpdateLocationDto,
} from './dto/delivery-partner.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { DeliveryPartnerJwtGuard } from './delivery-partner.guard';

@Controller('delivery-partners')
export class DeliveryPartnersController {
  private readonly logger = new Logger(DeliveryPartnersController.name);

  constructor(private readonly deliveryService: DeliveryPartnersService) {}

  // ─── PARTNER AUTHENTICATION ───

  @Post('login')
  async login(@Body() loginDto: LoginDeliveryPartnerDto) {
    this.logger.log(`Delivery partner login attempt: ${loginDto.phone}`);
    return this.deliveryService.login(loginDto);
  }

  // ─── PARTNER SELF ROUTES ───

  @UseGuards(DeliveryPartnerJwtGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    return req.deliveryPartner;
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch('me/location')
  async updateMyLocation(@Req() req: any, @Body() dto: UpdateLocationDto) {
    return this.deliveryService.updateLocation(req.deliveryPartner._id, dto);
  }

  @UseGuards(DeliveryPartnerJwtGuard)
  @Patch('me/profile')
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateDeliveryPartnerDto,
  ) {
    // Partners can only update certain fields themselves
    const allowedUpdates = {
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      vehicleType: dto.vehicleType,
      vehicleNumber: dto.vehicleNumber,
      bloodGroup: dto.bloodGroup,
      permanentAddress: dto.permanentAddress,
      currentAddress: dto.currentAddress,
      profileImage: dto.profileImage,
      availabilityStatus: dto.availabilityStatus,
    };
    return this.deliveryService.update(req.deliveryPartner._id, allowedUpdates);
  }

  // ─── ADMIN MANAGEMENT ROUTES ───

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async register(@Body() registerDto: RegisterDeliveryPartnerDto) {
    this.logger.log(
      `Admin registering new delivery partner: ${registerDto.phone}`,
    );
    return this.deliveryService.register(registerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.deliveryService.findAll({ page, limit, warehouseId });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async findOne(@Param('id') id: string) {
    return this.deliveryService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryPartnerDto) {
    return this.deliveryService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryPartnerDto,
  ) {
    // Admin can update accountStatus and availabilityStatus
    return this.deliveryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  async remove(@Param('id') id: string) {
    await this.deliveryService.remove(id);
    return { message: 'Delivery partner removed successfully' };
  }
}
