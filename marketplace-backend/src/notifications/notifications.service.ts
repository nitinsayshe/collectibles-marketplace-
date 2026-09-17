import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './notifications.schema';

interface CreateNotificationDto {
  recipient: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    const n = new this.notificationModel(dto);
    return n.save();
  }

  async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ recipient: userId, isRead: false });
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.notificationModel.updateOne({ _id: id, recipient: userId }, { isRead: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  }
}
