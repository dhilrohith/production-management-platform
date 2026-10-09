import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { SuppliersService } from '../../application/services/suppliers.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateSupplierDto, UpdateSupplierDto } from '../dtos/suppliers.dto';

@ApiTags('Suppliers & Procurement')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'List Suppliers' })
  listSuppliers(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.suppliersService.listSuppliers(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create Supplier' })
  createSupplier(@CompanyId() companyId: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(companyId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Supplier Details' })
  getSupplier(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.suppliersService.getSupplier(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Supplier' })
  updateSupplier(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.updateSupplier(companyId, id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate Supplier' })
  deactivateSupplier(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.suppliersService.deactivateSupplier(companyId, id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get Supplier Outstanding Balance' })
  getBalance(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.suppliersService.getBalance(companyId, id);
  }
}
