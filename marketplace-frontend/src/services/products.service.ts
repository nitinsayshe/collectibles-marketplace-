import api from '@/lib/api';
import { Product, CreateProductPayload, UpdateProductPayload } from '@/types/product.types';
import { ApiResponse } from '@/types/api.types';

interface ProductQuery {
  search?: string;
  category?: string;
  status?: string;
  owner?: string;
}

export const productsService = {
  async getAll(query: ProductQuery = {}): Promise<Product[]> {
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.category) params.set('category', query.category);
    if (query.status) params.set('status', query.status);
    if (query.owner) params.set('owner', query.owner);
    const { data } = await api.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);
    return data.data;
  },

  async getOne(id: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const { data } = await api.post<ApiResponse<Product>>('/products', payload);
    return data.data;
  },

  async getMine(): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>('/products/my');
    return data.data;
  },

  async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { data } = await api.patch<ApiResponse<Product>>(`/products/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
