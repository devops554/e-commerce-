import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private eventsGateway: EventsGateway,
  ) {}

  async create(data: {
    title: string;
    message: string;
    type: NotificationType;
    recipientRole: string;
    recipientId?: string;
    link?: string;
    metadata?: any;
  }) {
    const notification = new this.notificationModel(data);
    const saved = await notification.save();

    this.logger.log(
      `New notification created: ${data.title} for ${data.recipientRole}`,
    );

    // Emit real-time event
    this.eventsGateway.emitEvent('notification.received', saved);

    return saved;
  }

  async findAll(role: string, userId?: string, limit = 50) {
    const query: any = {};
    if (role === 'subadmin') {
      query.recipientRole = { $in: ['admin', 'subadmin'] };
    } else {
      query.recipientRole = role;
    }

    if (userId && role === 'customer') {
      query.recipientId = userId;
    }
    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAllAsRead(role: string, userId?: string) {
    const query: any = { isRead: false };
    if (role === 'subadmin') {
      query.recipientRole = { $in: ['admin', 'subadmin'] };
    } else {
      query.recipientRole = role;
    }

    if (userId && role === 'customer') {
      query.recipientId = userId;
    }
    await this.notificationModel.updateMany(query, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async deleteOldNotifications(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    await this.notificationModel.deleteMany({ createdAt: { $lt: date } });
  }

  async markAsRead(id: string) {
    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    notification.isRead = true;
    await notification.save();
    return notification;
  }
}
