import { IsString, IsEmail, IsOptional, IsUUID, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'P@ssword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'uuid-role-id' })
  @IsUUID()
  roleId: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'uuid-role-id' })
  @IsUUID()
  @IsOptional()
  roleId?: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'Inventory Manager' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Senior Inventory Manager' })
  @IsString()
  @IsOptional()
  name?: string;
}

export class ModulePermissionDto {
  @ApiProperty({ example: 'materials' })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({ example: ['view', 'create', 'update'] })
  @IsArray()
  @IsString({ each: true })
  actions: string[];
}

export class AssignPermissionsDto {
  @ApiProperty({ type: [ModulePermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModulePermissionDto)
  permissions: ModulePermissionDto[];
}
