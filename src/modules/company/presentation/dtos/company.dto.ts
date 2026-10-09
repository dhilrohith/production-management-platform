import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  legalName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pinCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  gstRegistered?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gstin?: string;
}

export class CloseFinancialYearDto {
  @ApiProperty({ description: 'Reason for closing the financial year' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CreateGSTConfigDto {
  @ApiProperty({ example: 'GST 18%' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 18.0 })
  @IsNumber()
  rate: number;

  @ApiProperty({ example: 9.0 })
  @IsNumber()
  cgstRate: number;

  @ApiProperty({ example: 9.0 })
  @IsNumber()
  sgstRate: number;

  @ApiProperty({ example: 18.0 })
  @IsNumber()
  igstRate: number;

  @ApiPropertyOptional({ example: '84818090' })
  @IsString()
  @IsOptional()
  hsnSac?: string;
}
