import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleDriveController } from './google-drive.controller';
import { GoogleDriveService } from './google-drive.service';
import { UsersModule } from '../users/users.module';
import { TokenCryptoService } from '../common/utils/token-crypto.util';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService, TokenCryptoService],
})
export class GoogleDriveModule {}
