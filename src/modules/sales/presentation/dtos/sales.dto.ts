import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../domain/enums/sales.enums';

export class CreateSaleLineDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  finishedProductVariantId: string;

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
  sellingPrice: number;
}

export class CreateSaleDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  financialYearId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  saleDate?: Date;

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

  @ApiProperty({ type: [CreateSaleLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleLineDto)
  lines: CreateSaleLineDto[];
}

export class CancelSaleDto {
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
}
