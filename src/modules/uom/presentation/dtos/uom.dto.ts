import { IsString, IsNotEmpty, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUOMDto {
  @ApiProperty({ example: 'Kilogram' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  symbol: string;
}

export class UpdateUOMDto {
  @ApiPropertyOptional({ example: 'Kilogram' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  symbol?: string;
}

export class CreateConversionDto {
  @ApiProperty({ description: 'Target UOM ID' })
  @IsUUID()
  toUomId: string;

  @ApiProperty({ example: 1000, description: '1 fromUom = factor toUom (e.g. 1 kg = 1000 g)' })
  @IsNumber()
  factor: number;
}

export class UpdateConversionDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  factor: number;
}
