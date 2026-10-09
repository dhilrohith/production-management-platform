import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ProductionService } from '../../application/services/production.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateProductionDto, CancelProductionDto } from '../dtos/production.dto';

@ApiTags('Production')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  @ApiOperation({ summary: 'List Production Runs with pagination & sorting' })
  listProductions(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.productionService.listProductions(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create & Confirm Production Run (Deducts RM, Creates Batch)' })
  createProduction(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProductionDto,
  ) {
    return this.productionService.createProduction(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Production Details' })
  getProduction(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.productionService.getProduction(companyId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel Production Run & Revert Raw Materials' })
  cancelProduction(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelProductionDto,
  ) {
    return this.productionService.cancelProduction(companyId, id, dto);
  }

  @Get('batches/:batchId')
  @ApiOperation({ summary: 'Get Batch Details & Available Stock' })
  getBatch(@CompanyId() companyId: string, @Param('batchId') batchId: string) {
    return this.productionService.getBatch(companyId, batchId);
  }
}
