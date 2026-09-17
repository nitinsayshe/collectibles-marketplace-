import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';

export interface ContactRequest {
  _id: string;
  sender: { _id: string; username: string; displayName: string; avatarUrl: string };
  receiver: { _id: string; username: string; displayName: string; avatarUrl: string };
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
}

export interface ContactStatus {
  status: 'none' | 'pending' | 'accepted' | 'rejected';
  id?: string;
  isSender?: boolean;
}

export const contactRequestsService = {
  async send(receiverId: string, message?: string): Promise<ContactRequest> {
    const { data } = await api.post<ApiResponse<ContactRequest>>('/contact-requests', { receiverId, message });
    return data.data;
  },

  async getIncoming(): Promise<ContactRequest[]> {
    const { data } = await api.get<ApiResponse<ContactRequest[]>>('/contact-requests/incoming');
    return data.data;
  },

  async getOutgoing(): Promise<ContactRequest[]> {
    const { data } = await api.get<ApiResponse<ContactRequest[]>>('/contact-requests/outgoing');
    return data.data;
  },

  async getStatus(userId: string): Promise<ContactStatus> {
    const { data } = await api.get<ApiResponse<ContactStatus>>(`/contact-requests/status/${userId}`);
    return data.data;
  },

  async accept(id: string): Promise<{ request: ContactRequest; conversationId: string }> {
    const { data } = await api.patch<ApiResponse<{ request: ContactRequest; conversationId: string }>>(`/contact-requests/${id}/accept`);
    return data.data;
  },

  async reject(id: string): Promise<void> {
    await api.patch(`/contact-requests/${id}/reject`);
  },
};
