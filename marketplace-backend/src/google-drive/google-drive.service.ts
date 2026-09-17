import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/users.schema';
import { TokenCryptoService } from '../common/utils/token-crypto.util';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const UPLOAD_FOLDER_NAME = 'Collectibles Marketplace Uploads';

interface DriveConnectState {
  purpose: 'google-drive-connect';
  userId: string;
}

interface CachedAccessToken {
  accessToken: string;
  expiryDate: number;
}

interface CachedFile {
  buffer: Buffer;
  contentType: string;
  cachedAt: number;
}

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private readonly accessTokenCache = new Map<string, CachedAccessToken>();
  private readonly fileCache = new Map<string, CachedFile>();
  private fileCacheBytes = 0;
  private readonly FILE_CACHE_TTL_MS = 60 * 60 * 1000;
  private readonly FILE_CACHE_MAX_BYTES = 200 * 1024 * 1024;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly tokenCrypto: TokenCryptoService,
  ) {}

  private createOAuthClient(): OAuth2Client {
    return new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_DRIVE_REDIRECT_URI'),
    );
  }

  getConnectUrl(userId: string): string {
    const state = this.jwtService.sign(
      { purpose: 'google-drive-connect', userId } satisfies DriveConnectState,
      { expiresIn: '5m' },
    );
    return this.createOAuthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [DRIVE_SCOPE],
      state,
    });
  }

  async handleCallback(code: string, state: string): Promise<void> {
    let payload: DriveConnectState;
    try {
      payload = this.jwtService.verify<DriveConnectState>(state);
    } catch {
      throw new BadRequestException('Connect link expired or invalid, please try again');
    }
    if (payload.purpose !== 'google-drive-connect' || !payload.userId) {
      throw new BadRequestException('Invalid connect request');
    }

    const client = this.createOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      throw new BadRequestException(
        'Google did not grant offline access — please try connecting again',
      );
    }
    client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: client });
    const folderId = await this.findOrCreateUploadFolder(drive);

    await this.usersService.connectGoogleDrive(payload.userId, {
      refreshToken: this.tokenCrypto.encrypt(tokens.refresh_token),
      folderId,
    });
  }

  async disconnect(user: UserDocument): Promise<void> {
    const userId = user._id.toString();
    try {
      const client = await this.getAuthorizedClient(userId);
      const refreshToken = client?.credentials.refresh_token;
      if (client && refreshToken) {
        await client.revokeToken(refreshToken);
      }
    } catch (err) {
      this.logger.warn(`Failed to revoke Google token for user ${userId}: ${err}`);
    }
    this.accessTokenCache.delete(userId);
    await this.usersService.disconnectGoogleDrive(userId);
  }

  async uploadImage(
    user: UserDocument,
    file: Express.Multer.File,
    previousUrl?: string,
  ): Promise<{ fileId: string; url: string }> {
    const userId = user._id.toString();
    const userWithToken = await this.usersService.findByIdWithDriveToken(userId);
    if (!userWithToken?.googleDriveConnected || !userWithToken.googleDriveFolderId) {
      throw new BadRequestException('Connect Google Drive before uploading images');
    }

    const fileId = await this.withDriveClient(userId, async (drive) => {
      const created = await drive.files.create({
        requestBody: {
          name: `${Date.now()}-${file.originalname}`,
          parents: [userWithToken.googleDriveFolderId],
        },
        media: {
          mimeType: file.mimetype,
          body: Readable.from(file.buffer),
        },
        fields: 'id',
      });
      return created.data.id!;
    });

    const previousFileId = this.extractFileId(previousUrl);
    if (previousFileId && previousFileId !== fileId) {
      this.deleteFileBestEffort(userId, previousFileId);
    }

    return { fileId, url: this.buildProxyUrl(userId, fileId) };
  }

  async streamFile(ownerId: string, fileId: string, res: Response): Promise<void> {
    const cached = this.fileCache.get(fileId);
    if (cached && Date.now() - cached.cachedAt < this.FILE_CACHE_TTL_MS) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(cached.buffer);
      return;
    }

    await this.withDriveClient(ownerId, async (drive) => {
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' },
      );
      const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';

      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        (response.data as Readable)
          .on('data', (chunk: Buffer) => chunks.push(chunk))
          .on('end', resolve)
          .on('error', reject);
      });
      const buffer = Buffer.concat(chunks);
      this.cacheFile(fileId, buffer, contentType);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(buffer);
    });
  }

  private async getAuthorizedClient(userId: string): Promise<OAuth2Client | null> {
    const userWithToken = await this.usersService.findByIdWithDriveToken(userId);
    if (!userWithToken?.googleDriveRefreshToken) return null;

    let refreshToken: string;
    try {
      refreshToken = this.tokenCrypto.decrypt(userWithToken.googleDriveRefreshToken);
    } catch (err) {
      this.logger.warn(`Failed to decrypt Drive token for user ${userId}: ${err}`);
      await this.usersService.disconnectGoogleDrive(userId);
      return null;
    }

    const client = this.createOAuthClient();
    const cached = this.accessTokenCache.get(userId);
    if (cached && cached.expiryDate > Date.now() + 60_000) {
      client.setCredentials({
        refresh_token: refreshToken,
        access_token: cached.accessToken,
        expiry_date: cached.expiryDate,
      });
    } else {
      client.setCredentials({ refresh_token: refreshToken });
    }

    client.on('tokens', (tokens) => {
      if (tokens.access_token && tokens.expiry_date) {
        this.accessTokenCache.set(userId, {
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date,
        });
      }
    });

    return client;
  }

  private async withDriveClient<T>(
    userId: string,
    fn: (drive: drive_v3.Drive) => Promise<T>,
  ): Promise<T> {
    const client = await this.getAuthorizedClient(userId);
    if (!client) {
      throw new UnauthorizedException('Google Drive is not connected for this account');
    }
    const drive = google.drive({ version: 'v3', auth: client });
    try {
      return await fn(drive);
    } catch (err: any) {
      const reason = err?.response?.data?.error || err?.message;
      if (reason === 'invalid_grant' || String(reason).includes('invalid_grant')) {
        this.accessTokenCache.delete(userId);
        await this.usersService.disconnectGoogleDrive(userId);
        throw new UnauthorizedException('Google Drive access was revoked, please reconnect');
      }
      throw err;
    }
  }

  private async findOrCreateUploadFolder(drive: drive_v3.Drive): Promise<string> {
    const existing = await drive.files.list({
      q: `name='${UPLOAD_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });
    if (existing.data.files?.length) {
      return existing.data.files[0].id!;
    }
    const created = await drive.files.create({
      requestBody: { name: UPLOAD_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id',
    });
    return created.data.id!;
  }

  private deleteFileBestEffort(userId: string, fileId: string): void {
    this.withDriveClient(userId, (drive) => drive.files.delete({ fileId })).catch((err) =>
      this.logger.warn(`Failed to delete old Drive file ${fileId}: ${err}`),
    );
  }

  private cacheFile(fileId: string, buffer: Buffer, contentType: string): void {
    if (buffer.length > this.FILE_CACHE_MAX_BYTES) return;
    while (this.fileCacheBytes + buffer.length > this.FILE_CACHE_MAX_BYTES && this.fileCache.size > 0) {
      const oldestKey = this.fileCache.keys().next().value as string;
      const oldest = this.fileCache.get(oldestKey);
      if (oldest) this.fileCacheBytes -= oldest.buffer.length;
      this.fileCache.delete(oldestKey);
    }
    this.fileCache.set(fileId, { buffer, contentType, cachedAt: Date.now() });
    this.fileCacheBytes += buffer.length;
  }

  private buildProxyUrl(ownerId: string, fileId: string): string {
    const base = this.config.get<string>('BACKEND_PUBLIC_URL') || 'http://localhost:3001';
    return `${base}/api/google-drive/file/${ownerId}/${fileId}`;
  }

  private extractFileId(url?: string): string | null {
    if (!url) return null;
    const match = url.match(/\/google-drive\/file\/[^/]+\/([^/?#]+)/);
    return match ? match[1] : null;
  }
}
