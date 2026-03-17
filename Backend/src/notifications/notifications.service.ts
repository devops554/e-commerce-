import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
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
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) { }

  async create(data: {
    title: string;
    message: string;
    type: NotificationType;
    recipientRole: string;
    recipientId?: string | any;
    link?: string;
    metadata?: any;
  }) {
    // Defensive check: if recipientId is a populated object, extract the string ID
    if (data.recipientId && typeof data.recipientId === 'object') {
      data.recipientId = data.recipientId._id?.toString() || data.recipientId.toString();
    }

    const notification = new this.notificationModel(data);
    const saved = await notification.save();

    this.logger.log(
      `New notification created: ${data.title} for ${data.recipientRole}${data.recipientId ? ` (${data.recipientId})` : ''}`,
    );

    // ✅ recipientId hai toh sirf us user ko bhejo
    if (data.recipientId) {
      this.eventsGateway.emitToUser(
        data.recipientId,
        'notification.received',
        saved,
      );
    } else {
      // Admin/manager jaise role-based — sabko bhejo
      this.eventsGateway.emitEvent('notification.received', saved);
    }

    return saved;
  }

  async findAll(role: string, userId?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (role === 'subadmin') {
      query.recipientRole = { $in: ['admin', 'subadmin'] };
    } else {
      query.recipientRole = role;
    }

    if (
      userId &&
      (role === 'customer' ||
        role === 'manager' ||
        role === 'seller' ||
        role === 'delivery_partner')
    ) {
      query.recipientId = userId;
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAllAsRead(role: string, userId?: string) {
    const query: any = { isRead: false };

    if (role === 'subadmin') {
      query.recipientRole = { $in: ['admin', 'subadmin'] };
    } else {
      query.recipientRole = role;
    }

    if (
      userId &&
      (role === 'customer' ||
        role === 'manager' ||
        role === 'seller' ||
        role === 'delivery_partner')
    ) {
      query.recipientId = userId;
    }

    await this.notificationModel.updateMany(query, { isRead: true });
    return { message: 'All notifications marked as read' };
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

  async deleteOldNotifications(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    await this.notificationModel.deleteMany({ createdAt: { $lt: date } });
  }
}