import api from '@/lib/api';
import { AuthResponse, LoginPayload, SignupPayload, User } from '@/types/user.types';
import { ApiResponse } from '@/types/api.types';

export const authService = {
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/signup', payload);
    return data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return data.data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
