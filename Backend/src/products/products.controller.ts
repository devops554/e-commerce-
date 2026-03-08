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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('products')
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

    constructor(private readonly productsService: ProductsService) { }

    // ─── PRODUCT ROUTES ───

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER)
    create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
        this.logger.log(`Creating product: ${createProductDto.title} by user ${req.user._id}`);
        return this.productsService.create(createProductDto, req.user._id);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('category') category?: string,
        @Query('subCategory') subCategory?: string,
        @Query('brand') brand?: string,
        @Query('isActive') isActive?: string,
        @Query('productType') productType?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('sort') sort?: string,
    ) {
        const p = page ? parseInt(page) : 1;
        const l = limit ? parseInt(limit) : 10;

        if (p < 1) throw new BadRequestException('Page must be greater than 0');
        if (l < 1 || l > 100) throw new BadRequestException('Limit must be between 1 and 100');

        return this.productsService.findAll({
            page: p,
            limit: l,
            search,
            category,
            subCategory,
            brand,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            productType,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sort,
        });
    }

    @Get('suggestions')
    getSuggestions(@Query('q') query: string) {
        return this.productsService.getSuggestions(query);
    }

    @Get(':id/variants')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER, UserRole.MANAGER)
    getVariants(@Param('id') id: string) {
        return this.productsService.getProductVariants(id);
    }

    @Get(':idOrSlug')
    findOne(@Param('idOrSlug') idOrSlug: string) {
        return this.productsService.findOne(idOrSlug);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER)
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: any) {
        this.logger.log(`Updating product: ${id} by user ${req.user._id}`);
        return this.productsService.update(id, updateProductDto, req.user._id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER)
    remove(@Param('id') id: string) {
        this.logger.warn(`Deleting product: ${id}`);
        return this.productsService.remove(id);
    }

    // ─── VARIANT ROUTES ───

    @Post('variants')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER)
    createVariant(@Body() createVariantDto: CreateVariantDto) {
        this.logger.log(`Creating variant for product: ${createVariantDto.product}`);
        return this.productsService.createVariant(createVariantDto);
    }

    @Patch('variants/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER)
    updateVariant(@Param('id') id: string, @Body() updateVariantDto: UpdateVariantDto, @Req() req: any) {
        this.logger.log(`Updating variant: ${id} by user ${req.user._id}`);
        return this.productsService.updateVariant(id, updateVariantDto, req.user._id, req.user.role);
    }

    @Delete('variants/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.SELLER)
    removeVariant(@Param('id') id: string) {
        this.logger.warn(`Deleting variant: ${id}`);
        return this.productsService.removeVariant(id);
    }
}
