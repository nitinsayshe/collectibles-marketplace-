import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';
import { User } from '@/types/user.types';

export interface Message {
  _id: string;
  conversation: string;
  sender: Pick<User, '_id' | 'username' | 'displayName' | 'avatarUrl'>;
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageAt?: string;
  createdAt: string;
}

export const conversationsService = {
  async getAll(): Promise<Conversation[]> {
    const { data } = await api.get<ApiResponse<Conversation[]>>('/conversations');
    return data.data;
  },

  async getMessages(conversationId: string, page = 1): Promise<Message[]> {
    const { data } = await api.get<ApiResponse<Message[]>>(
      `/conversations/${conversationId}/messages?page=${page}&limit=50`,
    );
    return data.data;
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const { data } = await api.post<ApiResponse<Message>>(
      `/conversations/${conversationId}/messages`,
      { content },
    );
    return data.data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<ApiResponse<number>>('/conversations/unread-count');
    return data.data;
  },
};
