import { IsUUID, IsEnum, IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdjustmentType } from '../../domain/enums/inventory.enums';

export class CreateStockAdjustmentDto {
  @ApiProperty({ description: 'Raw Material Variant UUID' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ enum: AdjustmentType, example: AdjustmentType.POSITIVE })
  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  adjustmentQuantity: number;

  @ApiPropertyOptional({ example: 120.50, description: 'Required for POSITIVE adjustments to compute WAC' })
  @IsNumber()
  @IsOptional()
  unitCost?: number;

  @ApiProperty({ example: 'Annual physical audit variance reconciliation' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'Financial Year UUID' })
  @IsUUID()
  financialYearId: string;
}

export class CancelStockAdjustmentDto {
  @ApiProperty({ example: 'Incorrect audit entry counts' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
