import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterCompanyDto {
  @ApiProperty({ example: 'Apex Manufacturing Pvt Ltd' })
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty({ example: 'Apex Mfg' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({ example: 'Plot 42, MIDC Industrial Area, Pune' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+912027123456' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@apexmanufacturing.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Admin User' })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({ example: 'admin@apexmanufacturing.com' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'AdminStrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  adminPassword: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@apexmanufacturing.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'AdminStrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'jwt.refresh.token.string' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
