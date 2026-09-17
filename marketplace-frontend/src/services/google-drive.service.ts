import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';

export interface UploadImageResult {
  fileId: string;
  url: string;
}

export const googleDriveService = {
  async getConnectUrl(): Promise<string> {
    const { data } = await api.get<ApiResponse<{ url: string }>>('/google-drive/connect');
    return data.data.url;
  },

  async disconnect(): Promise<void> {
    await api.delete('/google-drive/disconnect');
  },

  async upload(file: File, previousUrl?: string): Promise<UploadImageResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (previousUrl) formData.append('previousUrl', previousUrl);

    const { data } = await api.post<ApiResponse<UploadImageResult>>(
      '/google-drive/upload',
      formData,
    );
    return data.data;
  },
};
