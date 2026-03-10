import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUB_ADMIN,
    UserRole.CUSTOMER,
    UserRole.MANAGER,
  )
  async getNotifications(@Req() req: any) {
    return this.notificationsService.findAll(req.user.role, req.user.id);
  }

  @Patch(':id/read')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUB_ADMIN,
    UserRole.CUSTOMER,
    UserRole.MANAGER,
  )
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUB_ADMIN,
    UserRole.CUSTOMER,
    UserRole.MANAGER,
  )
  async markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.role, req.user.id);
  }
}
