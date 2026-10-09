import { IsUUID, IsNumber, IsArray, ValidateNested, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductionConsumptionItemDto {
  @ApiProperty({ description: 'Raw Material Variant UUID' })
  @IsUUID()
  rawMaterialVariantId: string;

  @ApiProperty({ example: 10.0 })
  @IsNumber()
  expectedQuantity: number;

  @ApiProperty({ example: 10.2 })
  @IsNumber()
  actualQuantity: number;

  @ApiPropertyOptional({ example: 10.2 })
  @IsNumber()
  @IsOptional()
  baseQuantity?: number;

  @ApiProperty({ description: 'UOM UUID' })
  @IsUUID()
  uomId: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}

export class CreateProductionDto {
  @ApiProperty({ description: 'Finished Product Variant UUID' })
  @IsUUID()
  finishedProductVariantId: string;

  @ApiProperty({ description: 'BOM UUID' })
  @IsUUID()
  bomId: string;

  @ApiProperty({ description: 'Financial Year UUID' })
  @IsUUID()
  financialYearId: string;

  @ApiPropertyOptional({ example: '2026-10-07' })
  @IsDateString()
  @IsOptional()
  productionDate?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  plannedQuantity: number;

  @ApiProperty({ example: 98 })
  @IsNumber()
  goodOutput: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  rejectedOutput?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  wastage?: number;

  @ApiPropertyOptional({ example: 'Minor heat seal misalignment on 2 units' })
  @IsString()
  @IsOptional()
  varianceReason?: string;

  @ApiPropertyOptional({ example: '2028-10-07' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ type: [ProductionConsumptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionConsumptionItemDto)
  consumptions: ProductionConsumptionItemDto[];
}

export class CancelProductionDto {
  @ApiProperty({ example: 'Equipment calibration fault' })
  @IsString()
  reason: string;
}

