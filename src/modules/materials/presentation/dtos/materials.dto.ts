import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRawMaterialDto {
  @ApiProperty({ example: 'Steel Sheets (Grade 304)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Cold rolled stainless steel sheets' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Base UOM UUID' })
  @IsUUID()
  baseUomId: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  expiryTracking?: boolean;
}

export class UpdateRawMaterialDto {
  @ApiPropertyOptional({ example: 'Steel Sheets (Grade 304L)' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  baseUomId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  expiryTracking?: boolean;
}

export class CreateMaterialVariantDto {
  @ApiProperty({ example: 'Steel Sheet 2mm 4x8' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'RM-STL-304-2MM' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateMaterialVariantDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
