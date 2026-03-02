import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    Req,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('product-types')
export class ProductTypesController {
    private readonly logger = new Logger(ProductTypesController.name);

    constructor(private readonly productTypesService: ProductTypesService) { }

    // ─── PUBLIC ROUTES ───

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string,
    ) {
        const p = page ? parseInt(page) : 1;
        const l = limit ? parseInt(limit) : 10;

        if (p < 1) throw new BadRequestException('Page must be greater than 0');
        if (l < 1 || l > 100) throw new BadRequestException('Limit must be between 1 and 100');

        return this.productTypesService.findAll({
            page: p,
            limit: l,
            search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':idOrSlug')
    findOne(@Param('idOrSlug') idOrSlug: string) {
        return this.productTypesService.findOne(idOrSlug);
    }

    // ─── ADMIN ROUTES ───

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    create(@Body() createProductTypeDto: CreateProductTypeDto, @Req() req: any) {
        this.logger.log(`Admin creating product type: ${createProductTypeDto.name} by user ${req.user._id}`);
        return this.productTypesService.create(createProductTypeDto, req.user._id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    update(@Param('id') id: string, @Body() updateProductTypeDto: UpdateProductTypeDto, @Req() req: any) {
        this.logger.log(`Admin updating product type: ${id} by user ${req.user._id}`);
        return this.productTypesService.update(id, updateProductTypeDto, req.user._id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    remove(@Param('id') id: string) {
        this.logger.warn(`Admin deleting product type: ${id}`);
        return this.productTypesService.remove(id);
    }
}
