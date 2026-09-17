import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendContactRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  receiverId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
