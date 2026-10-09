import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { MaterialsService } from '../../application/services/materials.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  CreateMaterialVariantDto,
  UpdateMaterialVariantDto,
} from '../dtos/materials.dto';

@ApiTags('Raw Materials')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @ApiOperation({ summary: 'List Raw Materials' })
  listRawMaterials(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.materialsService.listRawMaterials(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create Raw Material Master' })
  createRawMaterial(@CompanyId() companyId: string, @Body() dto: CreateRawMaterialDto) {
    return this.materialsService.createRawMaterial(companyId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Raw Material Details' })
  getRawMaterial(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.materialsService.getRawMaterial(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Raw Material Master' })
  updateRawMaterial(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRawMaterialDto,
  ) {
    return this.materialsService.updateRawMaterial(companyId, id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate Raw Material' })
  deactivateRawMaterial(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.materialsService.deactivateRawMaterial(companyId, id);
  }

  // --- Variants Endpoints ---
  @Post(':id/variants')
  @ApiOperation({ summary: 'Create Raw Material SKU Variant' })
  createVariant(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CreateMaterialVariantDto,
  ) {
    return this.materialsService.createVariant(companyId, id, dto);
  }

  @Put('variants/:variantId')
  @ApiOperation({ summary: 'Update Raw Material SKU Variant' })
  updateVariant(
    @CompanyId() companyId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateMaterialVariantDto,
  ) {
    return this.materialsService.updateVariant(companyId, variantId, dto);
  }

  @Patch('variants/:variantId/deactivate')
  @ApiOperation({ summary: 'Deactivate Raw Material SKU Variant' })
  deactivateVariant(@CompanyId() companyId: string, @Param('variantId') variantId: string) {
    return this.materialsService.deactivateVariant(companyId, variantId);
  }
}
