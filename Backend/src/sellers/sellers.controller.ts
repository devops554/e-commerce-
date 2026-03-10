import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Request() req, @Body() createSellerDto: CreateSellerDto) {
    return this.sellersService.create(req.user.id, createSellerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  @Get()
  async findAll() {
    return this.sellersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async getProfile(@Request() req) {
    // This would typically find by userId
    return this.sellersService.findOne(req.user.id); // Need a method by userId
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.sellersService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.sellersService.findBySlug(slug);
  }
}
