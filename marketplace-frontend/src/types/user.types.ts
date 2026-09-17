export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  role: 'user' | 'super_admin';
  isEmailVerified: boolean;
  isActive: boolean;
  isProfilePublic: boolean;
  city: string;
  whatsapp: string;
  instagram: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
