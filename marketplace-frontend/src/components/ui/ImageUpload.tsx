'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { googleDriveService } from '@/services/google-drive.service';
import { Button } from './Button';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const user = useAuthStore((s) => s.user);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const connected = !!user?.googleDriveConnected;

  const handleConnect = async () => {
    setError('');
    try {
      const url = await googleDriveService.getConnectUrl();
      window.location.href = url;
    } catch {
      setError('Failed to start Google Drive connection');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const result = await googleDriveService.upload(file, value);
      onChange(result.url);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex items-center gap-4">
        {value ? (
          <div className="w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-200 bg-gray-50">
            <Image src={value} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 text-2xl flex-shrink-0">
            🖼️
          </div>
        )}

        {connected ? (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
            </Button>
          </div>
        ) : (
          <div>
            <Button type="button" variant="secondary" onClick={handleConnect}>
              Connect Google Drive to upload
            </Button>
            <p className="text-xs text-gray-400 mt-1">Images are stored in your own Google Drive</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
