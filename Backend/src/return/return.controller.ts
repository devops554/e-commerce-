import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ReturnService } from './return.service';
import { CreateReturnDto } from './dto';

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateReturnDto) {
    return this.returnService.createReturn(req.user._id, dto);
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    const customerId = req.user.role === 'user' ? req.user._id : query.customerId;
    return this.returnService.getReturns(customerId, query);
  }

  @Get('my')
  async findMy(@Req() req: any, @Query() query: any) {
    return this.returnService.getReturns(req.user._id, query);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const customerId = req.user.role === 'user' ? req.user._id : undefined;
    return this.returnService.getReturnById(id, customerId);
  }

  @Delete(':id/cancel')
  async cancel(@Req() req: any, @Param('id') id: string) {
    return this.returnService.cancelReturn(req.user._id, id);
  }
}
