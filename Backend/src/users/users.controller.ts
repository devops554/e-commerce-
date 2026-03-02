import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Logger, Query, Patch } from '@nestjs/common';
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
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: UserStatus,
    ) {
        return this.usersService.update(id, { status });
    }
}
