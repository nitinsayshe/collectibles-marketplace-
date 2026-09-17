import { User } from './user.types';

export type ProductStatus = 'for_sale' | 'for_trade' | 'collection_only' | 'hidden';
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface Product {
  _id: string;
  owner: Pick<User, '_id' | 'username' | 'displayName' | 'avatarUrl'>;
  title: string;
  description: string;
  category: string;
  brand: string;
  condition: ProductCondition;
  askingPrice: number;
  status: ProductStatus;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  title: string;
  description?: string;
  category: string;
  brand?: string;
  condition?: ProductCondition;
  askingPrice?: number;
  status?: ProductStatus;
  imageUrl?: string;
}

export interface UpdateProductPayload {
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  condition?: ProductCondition;
  askingPrice?: number;
  status?: ProductStatus;
  imageUrl?: string;
}
