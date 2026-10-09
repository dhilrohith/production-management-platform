import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../../common/enums/transaction-status.enum';

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'Machinery Maintenance' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateExpenseCategoryDto {
  @ApiPropertyOptional({ example: 'Factory & Machinery Maintenance' })
  @IsString()
  @IsOptional()
  name?: string;
}

export class CreateExpenseDto {
  @ApiProperty({ description: 'Financial Year UUID' })
  @IsUUID()
  financialYearId: string;

  @ApiPropertyOptional({ example: '2026-10-07' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: 'Expense Category UUID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 12500.00 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'Quarterly CNC lathe machine servicing and oil change' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CancelExpenseDto {
  @ApiProperty({ example: 'Duplicate billing receipt' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
