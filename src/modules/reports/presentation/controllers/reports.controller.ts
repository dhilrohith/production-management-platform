import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ReportsService } from '../../application/queries/reports.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { DateRangeQueryDto, ExportReportDto } from '../dtos/reports.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get Sales Performance & Profit Margin Report' })
  getSalesReport(
    @CompanyId() companyId: string,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.reportsService.getSalesReport(companyId, query.fromDate, query.toDate);
  }

  @Get('purchases')
  @ApiOperation({ summary: 'Get Purchase Spend Report' })
  getPurchaseReport(
    @CompanyId() companyId: string,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.reportsService.getPurchaseReport(companyId, query.fromDate, query.toDate);
  }

  @Get('production')
  @ApiOperation({ summary: 'Get Production Output & Yield Report' })
  getProductionReport(
    @CompanyId() companyId: string,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.reportsService.getProductionReport(companyId, query.fromDate, query.toDate);
  }

  @Get('raw-material-stock')
  @ApiOperation({ summary: 'Get Raw Material Valuation & Inventory Report' })
  getRawMaterialStockReport(@CompanyId() companyId: string) {
    return this.reportsService.getRawMaterialStockReport(companyId);
  }

  @Get('finished-goods-stock')
  @ApiOperation({ summary: 'Get Finished Goods Batch Inventory Report' })
  getFinishedGoodsStockReport(@CompanyId() companyId: string) {
    return this.reportsService.getFinishedGoodsStockReport(companyId);
  }

  @Get('customer-outstanding')
  @ApiOperation({ summary: 'Get Customer Receivables Outstanding Aging Report' })
  getCustomerOutstandingReport(@CompanyId() companyId: string) {
    return this.reportsService.getCustomerOutstandingReport(companyId);
  }

  @Get('supplier-outstanding')
  @ApiOperation({ summary: 'Get Supplier Payables Outstanding Aging Report' })
  getSupplierOutstandingReport(@CompanyId() companyId: string) {
    return this.reportsService.getSupplierOutstandingReport(companyId);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Get Operational Expense Category Breakdown Report' })
  getExpenseReport(
    @CompanyId() companyId: string,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.reportsService.getExpenseReport(companyId, query.fromDate, query.toDate);
  }

  @Get('stock-adjustments')
  @ApiOperation({ summary: 'Get Stock Adjustment Audit Trail Report' })
  getStockAdjustmentReport(
    @CompanyId() companyId: string,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.reportsService.getStockAdjustmentReport(companyId, query.fromDate, query.toDate);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export Report Data (CSV / JSON format)' })
  exportReport(@CompanyId() companyId: string, @Body() dto: ExportReportDto) {
    return this.reportsService.exportReport(companyId, dto);
  }
}
