import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';

export interface UploadImageResult {
  url: string;
  publicId: string;
}

export const uploadsService = {
  async upload(file: File, previousUrl?: string): Promise<UploadImageResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (previousUrl) formData.append('previousUrl', previousUrl);

    const { data } = await api.post<ApiResponse<UploadImageResult>>('/uploads', formData);
    return data.data;
  },
};
