import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Put, Req } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('warehouses')
export class WarehousesController {
    constructor(private readonly warehousesService: WarehousesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    @Post()
    async create(@Body() createWarehouseDto: CreateWarehouseDto) {
        return this.warehousesService.create(createWarehouseDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
    @Get()
    async findAll() {
        return this.warehousesService.findAll();
    }

    // Manager apna warehouse
    @Get('manager')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    async getManagerWarehouse(@Req() req: any) {
        return this.warehousesService.findByManager(req.user.id);
    }

    // Admin specific manager warehouse
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @Get('manager/:managerId')
    async findByManager(@Param('managerId') managerId: string) {
        return this.warehousesService.findByManager(managerId);
    }

    // IMPORTANT : id route always last
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.warehousesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateWarehouseDto: any) {
        return this.warehousesService.update(id, updateWarehouseDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.warehousesService.remove(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    @Patch(':id/default')
    async setDefault(@Param('id') id: string) {
        return this.warehousesService.setDefault(id);
    }
}
