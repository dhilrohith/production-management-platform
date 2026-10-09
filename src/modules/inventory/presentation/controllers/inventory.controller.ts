import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { InventoryService } from '../../application/services/inventory.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateStockAdjustmentDto, CancelStockAdjustmentDto } from '../dtos/inventory.dto';

@ApiTags('Inventory & Stock Management')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock/raw-materials')
  @ApiOperation({ summary: 'Get current raw material stock levels and valuation' })
  getRawMaterialStock(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.inventoryService.getRawMaterialStock(companyId, pagination);
  }

  @Get('movements/:variantId')
  @ApiOperation({ summary: 'Get audit ledger of inventory movements for variant' })
  getMovements(
    @CompanyId() companyId: string,
    @Param('variantId') variantId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.inventoryService.getMovements(companyId, variantId, pagination);
  }

  @Get('adjustments')
  @ApiOperation({ summary: 'List physical audit stock adjustments' })
  listAdjustments(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.inventoryService.listAdjustments(companyId, pagination);
  }

  @Post('adjustments')
  @ApiOperation({ summary: 'Create physical audit stock adjustment (Positive/Negative)' })
  createStockAdjustment(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStockAdjustmentDto,
  ) {
    return this.inventoryService.createStockAdjustment(companyId, userId, dto);
  }

  @Patch('adjustments/:id/cancel')
  @ApiOperation({ summary: 'Cancel stock adjustment and reverse inventory balances' })
  cancelStockAdjustment(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CancelStockAdjustmentDto,
  ) {
    return this.inventoryService.cancelStockAdjustment(companyId, userId, id, dto);
  }
}
