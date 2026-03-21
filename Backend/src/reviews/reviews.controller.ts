import { Controller, Get, Post, Body, Query, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewStatus } from '../products/schemas/review.schema';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() dto: any) {
    return this.reviewsService.create(req.user._id.toString(), dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.reviewsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Put(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.MANAGER)
  moderate(@Req() req, @Param('id') id: string, @Body() dto: { status: ReviewStatus; rejectionReason?: string }) {
    return this.reviewsService.moderate(id, req.user._id.toString(), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
