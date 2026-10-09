import { IsUUID, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BOMLineItemDto {
  @ApiProperty({ description: 'Raw Material Variant UUID' })
  @IsUUID()
  rawMaterialVariantId: string;

  @ApiProperty({ example: 2.5, description: 'Required quantity per unit of finished product' })
  @IsNumber()
  expectedQuantity: number;

  @ApiProperty({ description: 'UOM UUID' })
  @IsUUID()
  uomId: string;
}

export class CreateBOMDto {
  @ApiProperty({ description: 'Finished Product Variant UUID' })
  @IsUUID()
  finishedProductVariantId: string;

  @ApiProperty({ type: [BOMLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BOMLineItemDto)
  lines: BOMLineItemDto[];
}

export class UpdateBOMDto {
  @ApiPropertyOptional({ type: [BOMLineItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BOMLineItemDto)
  lines?: BOMLineItemDto[];
}
