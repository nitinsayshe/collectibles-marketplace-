import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ProductStatus } from '../products.schema';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsMongoId()
  owner?: string;
}
