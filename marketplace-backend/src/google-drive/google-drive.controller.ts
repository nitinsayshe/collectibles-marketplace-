import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { GoogleDriveService } from './google-drive.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { UserDocument } from '../users/users.schema';

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Get('connect')
  @UseGuards(JwtAuthGuard)
  connect(@CurrentUser() user: UserDocument) {
    return { url: this.googleDriveService.getConnectUrl(user._id.toString()) };
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      await this.googleDriveService.handleCallback(code, state);
      res.redirect(`${frontendUrl}/profile?drive=connected`);
    } catch {
      res.redirect(`${frontendUrl}/profile?drive=error`);
    }
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnect(@CurrentUser() user: UserDocument) {
    await this.googleDriveService.disconnect(user);
    return { googleDriveConnected: false };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(new BadRequestException('Only PNG, JPEG, WEBP or GIF images are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('previousUrl') previousUrl: string | undefined,
    @CurrentUser() user: UserDocument,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.googleDriveService.uploadImage(user, file, previousUrl);
  }

  @Get('file/:ownerId/:fileId')
  async getFile(
    @Param('ownerId', ParseObjectIdPipe) ownerId: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    await this.googleDriveService.streamFile(ownerId, fileId, res);
  }
}
