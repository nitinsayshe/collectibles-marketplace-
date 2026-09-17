import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  async getAll(): Promise<AppNotification[]> {
    const { data } = await api.get<ApiResponse<AppNotification[]>>('/notifications');
    return data.data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<ApiResponse<number>>('/notifications/unread-count');
    return data.data;
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
