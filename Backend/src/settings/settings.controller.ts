import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('store-config')
  async getStoreConfig() {
    return this.settingsService.getConfig();
  }

  @Patch('store-config')
  async updateStoreConfig(@Body() data: any) {
    return this.settingsService.updateConfig(data);
  }
}
