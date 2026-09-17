import api from '@/lib/api';
import { User } from '@/types/user.types';
import { ApiResponse } from '@/types/api.types';

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  isProfilePublic?: boolean;
  city?: string;
  whatsapp?: string;
  instagram?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const usersService = {
  async getCollectors(): Promise<User[]> {
    const { data } = await api.get<ApiResponse<User[]>>('/users');
    return data.data;
  },

  async getProfile(id: string): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  async getMyProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/users/profile');
    return data.data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>('/users/profile', payload);
    return data.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.patch('/users/change-password', payload);
  },
};
