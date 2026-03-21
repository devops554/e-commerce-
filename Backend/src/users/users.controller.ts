import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
  Query,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, UserStatus } from '../users/schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return this.usersService.findById(req.user._id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() updateData: { name?: string; phone?: string; profilePic?: string }) {
    return this.usersService.updateProfile(req.user._id, updateData);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: any, @Body() body: any) {
    const { currentPassword, newPassword } = body;
    await this.usersService.changePassword(req.user._id, currentPassword, newPassword);
    return { message: 'Password updated successfully' };
  }

  @Post('address')
  @UseGuards(JwtAuthGuard)
  addAddress(@Req() req: any, @Body() addressData: any) {
    return this.usersService.addAddress(req.user._id, addressData);
  }

  @Delete('address/:addressId')
  @UseGuards(JwtAuthGuard)
  removeAddress(@Req() req: any, @Param('addressId') addressId: string) {
    return this.usersService.removeAddress(req.user._id, addressId);
  }

  @Post('bank-account')
  @UseGuards(JwtAuthGuard)
  addBankAccount(@Req() req: any, @Body() bankAccountData: any) {
    return this.usersService.addBankAccount(req.user._id, bankAccountData);
  }

  @Delete('bank-account/:accountId')
  @UseGuards(JwtAuthGuard)
  removeBankAccount(@Req() req: any, @Param('accountId') accountId: string) {
    return this.usersService.removeBankAccount(req.user._id, accountId);
  }

  @Get('all')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page, limit, role, status, search);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.usersService.update(id, { status });
  }
}
