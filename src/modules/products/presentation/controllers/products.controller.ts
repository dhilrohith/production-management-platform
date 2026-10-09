import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ProductsService } from '../../application/services/products.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateFinishedProductDto,
  UpdateFinishedProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from '../dtos/products.dto';

@ApiTags('Finished Products')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List Finished Products' })
  listFinishedProducts(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.productsService.listFinishedProducts(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create Finished Product Master' })
  createFinishedProduct(@CompanyId() companyId: string, @Body() dto: CreateFinishedProductDto) {
    return this.productsService.createFinishedProduct(companyId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Finished Product Details' })
  getFinishedProduct(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.productsService.getFinishedProduct(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Finished Product Master' })
  updateFinishedProduct(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFinishedProductDto,
  ) {
    return this.productsService.updateFinishedProduct(companyId, id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate Finished Product' })
  deactivateFinishedProduct(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.productsService.deactivateFinishedProduct(companyId, id);
  }

  // --- Variants Endpoints ---
  @Post(':id/variants')
  @ApiOperation({ summary: 'Create Product SKU Variant' })
  createVariant(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productsService.createVariant(companyId, id, dto);
  }

  @Put('variants/:variantId')
  @ApiOperation({ summary: 'Update Product SKU Variant' })
  updateVariant(
    @CompanyId() companyId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.productsService.updateVariant(companyId, variantId, dto);
  }

  @Patch('variants/:variantId/deactivate')
  @ApiOperation({ summary: 'Deactivate Product SKU Variant' })
  deactivateVariant(@CompanyId() companyId: string, @Param('variantId') variantId: string) {
    return this.productsService.deactivateVariant(companyId, variantId);
  }
}
