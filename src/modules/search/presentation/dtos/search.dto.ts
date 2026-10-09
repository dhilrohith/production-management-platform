import { IsNotEmpty, IsString, MinLength, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GlobalSearchDto {
  @ApiProperty({ description: 'Search term (minimum 2 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  q: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class SearchMaterialsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  q: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  uomId?: string;
}

export class SearchTransactionsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  q: string;

  @ApiPropertyOptional({ enum: ['PURCHASE', 'SALE', 'PRODUCTION'] })
  @IsOptional()
  @IsString()
  type?: string;
}
