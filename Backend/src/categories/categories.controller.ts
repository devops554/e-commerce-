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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('categories')
export class CategoriesController {
    private readonly logger = new Logger(CategoriesController.name);

    constructor(private readonly categoriesService: CategoriesService) { }

    // ─── PUBLIC ROUTES ───

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('productType') productType?: string,
        @Query('parentId') parentId?: string,
        @Query('isActive') isActive?: string,
        @Query('sort') sort?: string,
    ) {
        const p = page ? parseInt(page) : 1;
        const l = limit ? parseInt(limit) : 10;

        if (p < 1) throw new BadRequestException('Page must be greater than 0');
        if (l < 1 || l > 100) throw new BadRequestException('Limit must be between 1 and 100');

        return this.categoriesService.findAll({
            page: p,
            limit: l,
            search,
            productType,
            parentId: parentId === 'null' ? null : parentId,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            sort,
        });
    }

    @Get(':parentId/subcategories')
    findAllSubcategories(
        @Param('parentId') parentId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('productType') productType?: string,
        @Query('isActive') isActive?: string,
        @Query('sort') sort?: string,
    ) {
        const p = page ? parseInt(page) : 1;
        const l = limit ? parseInt(limit) : 10;

        if (p < 1) throw new BadRequestException('Page must be greater than 0');
        if (l < 1 || l > 100) throw new BadRequestException('Limit must be between 1 and 100');

        return this.categoriesService.findAll({
            page: p,
            limit: l,
            search,
            productType,
            parentId,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            sort,
        });
    }

    @Get(':idOrSlug')
    findOne(@Param('idOrSlug') idOrSlug: string) {
        return this.categoriesService.findOne(idOrSlug);
    }

    // ─── ADMIN ROUTES ───

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
        this.logger.log(`Admin creating category: ${createCategoryDto.name} by user ${req.user._id}`);
        return this.categoriesService.create(createCategoryDto, req.user._id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Req() req: any) {
        this.logger.log(`Admin updating category: ${id} by user ${req.user._id}`);
        return this.categoriesService.update(id, updateCategoryDto, req.user._id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
    remove(@Param('id') id: string) {
        this.logger.warn(`Admin deleting category: ${id}`);
        return this.categoriesService.remove(id);
    }
}
