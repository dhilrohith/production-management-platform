import { Injectable, Optional } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CacheService } from '../../../../infrastructure/cache/redis/cache.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dataSource: DataSource,
    @Optional() private readonly cacheService?: CacheService,
  ) {}

  async getDashboard(companyId: string) {
    const cacheKey = `dashboard:${companyId}:summary`;
    if (this.cacheService) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;
    }

    const rawStock = await this.dataSource.query(
      `SELECT COUNT(*) as variant_count, COALESCE(SUM(usable_quantity), 0) as total_usable_qty FROM raw_material_stocks WHERE company_id = $1`,
      [companyId],
    );

    const fgStock = await this.dataSource.query(
      `SELECT COUNT(*) as batch_count, COALESCE(SUM(available_quantity), 0) as total_available_qty FROM production_batches WHERE company_id = $1 AND status = 'AVAILABLE'`,
      [companyId],
    );

    const salesStats = await this.dataSource.query(
      `SELECT COUNT(*) as total_sales_count, COALESCE(SUM(total_amount), 0) as total_revenue FROM sales WHERE company_id = $1 AND status = 'CONFIRMED'`,
      [companyId],
    );

    const purchaseStats = await this.dataSource.query(
      `SELECT COUNT(*) as total_purchase_count, COALESCE(SUM(total_amount), 0) as total_spend FROM purchases WHERE company_id = $1 AND status = 'CONFIRMED'`,
      [companyId],
    );

    const customerReceivables = await this.dataSource.query(
      `SELECT COALESCE(SUM(outstanding_balance), 0) as total_receivables FROM customers WHERE company_id = $1`,
      [companyId],
    );

    const supplierPayables = await this.dataSource.query(
      `SELECT COALESCE(SUM(outstanding_balance), 0) as total_payables FROM suppliers WHERE company_id = $1`,
      [companyId],
    );

    const result = {
      companyId,
      rawMaterialStock: rawStock[0],
      finishedGoodsStock: fgStock[0],
      sales: salesStats[0],
      purchases: purchaseStats[0],
      receivables: customerReceivables[0]?.total_receivables || 0,
      payables: supplierPayables[0]?.total_payables || 0,
    };

    if (this.cacheService) {
      await this.cacheService.set(cacheKey, result, { ttlSeconds: 30 }); // 30 seconds TTL
    }

    return result;
  }

  async getEstimatedProfit(companyId: string) {
    const cacheKey = `dashboard:${companyId}:profit`;
    if (this.cacheService) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;
    }

    const salesData = await this.dataSource.query(
      `SELECT COALESCE(SUM(total_amount), 0) as revenue, COALESCE(SUM(estimated_cogs), 0) as cogs FROM sales WHERE company_id = $1 AND status = 'CONFIRMED'`,
      [companyId],
    );

    const expenseData = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE company_id = $1 AND status = 'CONFIRMED'`,
      [companyId],
    );

    const revenue = Number(salesData[0]?.revenue || 0);
    const cogs = Number(salesData[0]?.cogs || 0);
    const grossProfit = revenue - cogs;
    const expenses = Number(expenseData[0]?.total_expenses || 0);
    const netProfit = grossProfit - expenses;

    const result = {
      companyId,
      revenue,
      cogs,
      grossProfit,
      expenses,
      netProfit,
    };

    if (this.cacheService) {
      await this.cacheService.set(cacheKey, result, { ttlSeconds: 30 }); // 30 seconds TTL
    }

    return result;
  }
}
