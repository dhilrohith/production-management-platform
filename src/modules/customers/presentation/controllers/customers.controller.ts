import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CustomersService } from '../../application/services/customers.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/customers.dto';

@ApiTags('Customers & CRM')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List Customers' })
  listCustomers(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.customersService.listCustomers(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create Customer' })
  createCustomer(@CompanyId() companyId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.createCustomer(companyId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Customer Details' })
  getCustomer(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.customersService.getCustomer(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Customer' })
  updateCustomer(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(companyId, id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate Customer' })
  deactivateCustomer(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.customersService.deactivateCustomer(companyId, id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get Customer Outstanding Balance' })
  getBalance(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.customersService.getBalance(companyId, id);
  }
}
