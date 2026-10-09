import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../domain/enums/payments.enums';

export class CreateCustomerPaymentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  financialYearId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentDate?: Date;
}

export class CancelCustomerPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
}

export class CreateSupplierPaymentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  financialYearId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentDate?: Date;
}

export class CancelSupplierPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
}
