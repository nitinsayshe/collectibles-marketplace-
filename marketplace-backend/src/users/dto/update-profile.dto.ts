import { IsBoolean, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+\d\s\-()]*$/, { message: 'Invalid phone number format' })
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Matches(/^@?[\w.]+$/, { message: 'Invalid Instagram handle' })
  instagram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+\d\s\-()]*$/, { message: 'Invalid phone number format' })
  phone?: string;
}
