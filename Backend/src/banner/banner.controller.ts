import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import {
  CreateBannerDto,
  BannerQueryDto,
  UpdateBannerDto,
} from './dto/banner.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

// ── Public routes ────────────────────────────────────────────────────────────
@Controller('banners')
export class BannerPublicController {
  constructor(private readonly bannerService: BannerService) {}

  // GET /banners/page/:page  →  active banners for a given page slug
  @Get('page/:page')
  findByPage(@Param('page') page: string) {
    return this.bannerService.findByPage(page);
  }

  // GET /banners/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannerService.findOne(id);
  }
}

// ── Admin / Sub-admin routes ──────────────────────────────────────────────────
@Controller('admin/banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
export class BannerAdminController {
  constructor(private readonly bannerService: BannerService) {}

  // POST /admin/banners
  @Post()
  create(@Body() dto: CreateBannerDto, @Req() req: any) {
    return this.bannerService.create(dto, req.user._id);
  }

  // GET /admin/banners?page=1&limit=10&status=active&pages=home
  @Get()
  findAll(@Query() query: BannerQueryDto) {
    return this.bannerService.findAll(query);
  }

  // GET /admin/banners/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannerService.findOne(id);
  }

  // PUT /admin/banners/:id
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @Req() req: any,
  ) {
    return this.bannerService.update(id, dto, req.user._id);
  }

  // DELETE /admin/banners/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
}
