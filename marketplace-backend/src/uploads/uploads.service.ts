import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

const UPLOAD_ROOT_FOLDER = 'collectibles-marketplace';

export interface UploadImageResult {
  url: string;
  publicId: string;
}

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async uploadImage(
    userId: string,
    file: Express.Multer.File,
    previousUrl?: string,
  ): Promise<UploadImageResult> {
    const result = await this.uploadBuffer(file.buffer, `${UPLOAD_ROOT_FOLDER}/${userId}`);

    const previousPublicId = this.extractPublicId(previousUrl);
    if (previousPublicId && previousPublicId !== result.public_id) {
      cloudinary.uploader.destroy(previousPublicId).catch((err) =>
        this.logger.warn(`Failed to delete old Cloudinary image ${previousPublicId}: ${err}`),
      );
    }

    return { url: result.secure_url, publicId: result.public_id };
  }

  private uploadBuffer(buffer: Buffer, folder: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(new InternalServerErrorException(error?.message || 'Image upload failed'));
            return;
          }
          resolve(result);
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  private extractPublicId(url?: string): string | null {
    if (!url) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+(?:\?.*)?$/);
    return match ? match[1] : null;
  }
}
