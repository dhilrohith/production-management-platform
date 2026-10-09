import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../domain/enums/purchases.enums';

export class CreatePurchaseLineDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  rawMaterialVariantId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.000001)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  baseQuantity?: number;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  uomId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;
}

export class CreatePurchaseDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  financialYearId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  purchaseDate?: Date;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  gstConfigId: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  cgstAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sgstAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  igstAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ type: [CreatePurchaseLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseLineDto)
  lines: CreatePurchaseLineDto[];
}

export class CancelPurchaseDto {
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
}
