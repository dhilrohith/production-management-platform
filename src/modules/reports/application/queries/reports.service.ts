import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExportReportDto } from '../../presentation/dtos/reports.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async getSalesReport(companyId: string, fromDate?: string, toDate?: string) {
    return this.dataSource.query(
      `SELECT s.id, s.reference, s.sale_date, c.business_name as customer_name, s.total_amount, s.estimated_cogs, (s.total_amount - s.estimated_cogs) as margin, s.status 
       FROM sales s 
       JOIN customers c ON s.customer_id = c.id 
       WHERE s.company_id = $1 
       AND ($2::date IS NULL OR s.sale_date >= $2::date) 
       AND ($3::date IS NULL OR s.sale_date <= $3::date)
       ORDER BY s.sale_date DESC`,
      [companyId, fromDate || null, toDate || null],
    );
  }

  async getPurchaseReport(companyId: string, fromDate?: string, toDate?: string) {
    return this.dataSource.query(
      `SELECT p.id, p.reference, p.purchase_date, sup.business_name as supplier_name, p.total_amount, p.payment_state, p.status 
       FROM purchases p 
       JOIN suppliers sup ON p.supplier_id = sup.id 
       WHERE p.company_id = $1 
       AND ($2::date IS NULL OR p.purchase_date >= $2::date) 
       AND ($3::date IS NULL OR p.purchase_date <= $3::date)
       ORDER BY p.purchase_date DESC`,
      [companyId, fromDate || null, toDate || null],
    );
  }

  async getProductionReport(companyId: string, fromDate?: string, toDate?: string) {
    return this.dataSource.query(
      `SELECT pr.id, pr.reference, pr.production_date, fpv.name as product_variant, pr.planned_quantity, pr.good_output, pr.rejected_output, pr.wastage, pr.total_material_cost, pr.status 
       FROM productions pr 
       JOIN finished_product_variants fpv ON pr.finished_product_variant_id = fpv.id 
       WHERE pr.company_id = $1 
       AND ($2::date IS NULL OR pr.production_date >= $2::date) 
       AND ($3::date IS NULL OR pr.production_date <= $3::date)
       ORDER BY pr.production_date DESC`,
      [companyId, fromDate || null, toDate || null],
    );
  }

  async getRawMaterialStockReport(companyId: string) {
    return this.dataSource.query(
      `SELECT rm.name as material_name, rmv.name as variant_name, rmv.sku, u.symbol as uom, rms.usable_quantity, rms.weighted_average_cost, (rms.usable_quantity * rms.weighted_average_cost) as total_valuation 
       FROM raw_material_stocks rms 
       JOIN raw_material_variants rmv ON rms.variant_id = rmv.id 
       JOIN raw_materials rm ON rmv.raw_material_id = rm.id 
       JOIN uoms u ON rm.base_uom_id = u.id 
       WHERE rms.company_id = $1 
       ORDER BY rm.name ASC`,
      [companyId],
    );
  }

  async getFinishedGoodsStockReport(companyId: string) {
    return this.dataSource.query(
      `SELECT fp.name as product_name, fpv.name as variant_name, pb.batch_number, pb.available_quantity, pb.batch_unit_cost, pb.expiry_date, pb.status 
       FROM production_batches pb 
       JOIN finished_product_variants fpv ON pb.finished_product_variant_id = fpv.id 
       JOIN finished_products fp ON fpv.product_id = fp.id 
       WHERE pb.company_id = $1 
       ORDER BY pb.expiry_date ASC`,
      [companyId],
    );
  }

  async getCustomerOutstandingReport(companyId: string) {
    return this.dataSource.query(
      `SELECT id, business_name, contact_person, phone, email, outstanding_balance 
       FROM customers 
       WHERE company_id = $1 AND outstanding_balance > 0 
       ORDER BY outstanding_balance DESC`,
      [companyId],
    );
  }

  async getSupplierOutstandingReport(companyId: string) {
    return this.dataSource.query(
      `SELECT id, business_name, contact_person, phone, email, outstanding_balance 
       FROM suppliers 
       WHERE company_id = $1 AND outstanding_balance > 0 
       ORDER BY outstanding_balance DESC`,
      [companyId],
    );
  }

  async getExpenseReport(companyId: string, fromDate?: string, toDate?: string) {
    return this.dataSource.query(
      `SELECT e.id, e.date, ec.name as category, e.amount, e.payment_method, e.description, e.status 
       FROM expenses e 
       JOIN expense_categories ec ON e.category_id = ec.id 
       WHERE e.company_id = $1 
       AND ($2::date IS NULL OR e.date >= $2::date) 
       AND ($3::date IS NULL OR e.date <= $3::date)
       ORDER BY e.date DESC`,
      [companyId, fromDate || null, toDate || null],
    );
  }

  async getStockAdjustmentReport(companyId: string, fromDate?: string, toDate?: string) {
    return this.dataSource.query(
      `SELECT sa.id, sa.reference, sa.created_at, rmv.name as variant_name, sa.type, sa.adjustment_quantity, sa.unit_cost, sa.reason, sa.status 
       FROM stock_adjustments sa 
       JOIN raw_material_variants rmv ON sa.variant_id = rmv.id 
       WHERE sa.company_id = $1 
       AND ($2::date IS NULL OR sa.created_at >= $2::date) 
       AND ($3::date IS NULL OR sa.created_at <= $3::date)
       ORDER BY sa.created_at DESC`,
      [companyId, fromDate || null, toDate || null],
    );
  }

  async exportReport(companyId: string, dto: ExportReportDto) {
    let data: any[] = [];
    switch (dto.reportType) {
      case 'SALES': data = await this.getSalesReport(companyId, dto.fromDate, dto.toDate); break;
      case 'PURCHASES': data = await this.getPurchaseReport(companyId, dto.fromDate, dto.toDate); break;
      case 'PRODUCTION': data = await this.getProductionReport(companyId, dto.fromDate, dto.toDate); break;
      case 'RAW_MATERIAL_STOCK': data = await this.getRawMaterialStockReport(companyId); break;
      case 'FINISHED_GOODS_STOCK': data = await this.getFinishedGoodsStockReport(companyId); break;
      case 'CUSTOMER_OUTSTANDING': data = await this.getCustomerOutstandingReport(companyId); break;
      case 'SUPPLIER_OUTSTANDING': data = await this.getSupplierOutstandingReport(companyId); break;
      case 'EXPENSES': data = await this.getExpenseReport(companyId, dto.fromDate, dto.toDate); break;
      default: data = await this.getSalesReport(companyId, dto.fromDate, dto.toDate); break;
    }

    return {
      reportType: dto.reportType,
      format: dto.format || 'CSV',
      exportedAt: new Date().toISOString(),
      recordCount: data.length,
      data,
    };
  }
}
