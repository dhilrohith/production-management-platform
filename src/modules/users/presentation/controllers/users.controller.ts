import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
} from '../dtos/users.dto';

@ApiTags('Users & RBAC')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('Administrator')
  @ApiOperation({ summary: 'List tenant users' })
  listUsers(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.usersService.listUsers(companyId, pagination);
  }

  @Post()
  @Roles('Administrator')
  @ApiOperation({ summary: 'Create a new user' })
  createUser(@CompanyId() companyId: string, @Body() dto: CreateUserDto) {
    return this.usersService.createUser(companyId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  getUser(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.usersService.getUser(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile' })
  updateUser(@CompanyId() companyId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(companyId, id, dto);
  }

  @Patch(':id/deactivate')
  @Roles('Administrator')
  @ApiOperation({ summary: 'Deactivate user' })
  deactivateUser(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.usersService.deactivateUser(companyId, id);
  }

  // --- Roles Endpoints ---
  @Get('roles/all')
  @Roles('Administrator')
  @ApiOperation({ summary: 'List roles and assigned permissions' })
  listRoles(@CompanyId() companyId: string) {
    return this.usersService.listRoles(companyId);
  }

  @Post('roles')
  @Roles('Administrator')
  @ApiOperation({ summary: 'Create custom tenant role' })
  createRole(@CompanyId() companyId: string, @Body() dto: CreateRoleDto) {
    return this.usersService.createRole(companyId, dto);
  }

  @Get('roles/:id')
  @Roles('Administrator')
  @ApiOperation({ summary: 'Get role details' })
  getRole(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.usersService.getRole(companyId, id);
  }

  @Put('roles/:id')
  @Roles('Administrator')
  @ApiOperation({ summary: 'Update role' })
  updateRole(@CompanyId() companyId: string, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(companyId, id, dto);
  }

  @Patch('roles/:id/deactivate')
  @Roles('Administrator')
  @ApiOperation({ summary: 'Deactivate role' })
  deactivateRole(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.usersService.deactivateRole(companyId, id);
  }

  @Post('roles/:id/permissions')
  @Roles('Administrator')
  @ApiOperation({ summary: 'Assign granular module permissions to role' })
  assignPermissions(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.usersService.assignPermissions(companyId, id, dto);
  }
}
