import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinishedProductDto {
  @ApiProperty({ example: 'Industrial Centrifugal Pump' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'High flow centrifugal pump for industrial liquids' })
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

export class UpdateFinishedProductDto {
  @ApiPropertyOptional()
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

export class CreateProductVariantDto {
  @ApiProperty({ example: 'Centrifugal Pump 5HP' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'FP-PMP-5HP' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ example: 45000.00 })
  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProductVariantDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
