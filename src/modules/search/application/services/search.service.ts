import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SearchService {
  constructor(private readonly dataSource: DataSource) {}

  async globalSearch(companyId: string, query: string, limit = 20) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query term must be at least 2 characters long');
    }

    const term = `%${query.trim()}%`;

    const customers = await this.dataSource.query(
      `SELECT 'CUSTOMER' as type, id, business_name as title, contact_person as subtitle FROM customers WHERE company_id = $1 AND (business_name ILIKE $2 OR contact_person ILIKE $2 OR email ILIKE $2) LIMIT $3`,
      [companyId, term, limit],
    );

    const suppliers = await this.dataSource.query(
      `SELECT 'SUPPLIER' as type, id, business_name as title, contact_person as subtitle FROM suppliers WHERE company_id = $1 AND (business_name ILIKE $2 OR contact_person ILIKE $2 OR email ILIKE $2) LIMIT $3`,
      [companyId, term, limit],
    );

    const materials = await this.dataSource.query(
      `SELECT 'RAW_MATERIAL' as type, rmv.id, rmv.name as title, rmv.sku as subtitle FROM raw_material_variants rmv WHERE rmv.company_id = $1 AND (rmv.name ILIKE $2 OR rmv.sku ILIKE $2) LIMIT $3`,
      [companyId, term, limit],
    );

    const products = await this.dataSource.query(
      `SELECT 'FINISHED_PRODUCT' as type, fpv.id, fpv.name as title, fpv.sku as subtitle FROM finished_product_variants fpv WHERE fpv.company_id = $1 AND (fpv.name ILIKE $2 OR fpv.sku ILIKE $2) LIMIT $3`,
      [companyId, term, limit],
    );

    const sales = await this.dataSource.query(
      `SELECT 'SALE' as type, id, reference as title, status as subtitle FROM sales WHERE company_id = $1 AND reference ILIKE $2 LIMIT $3`,
      [companyId, term, limit],
    );

    const purchases = await this.dataSource.query(
      `SELECT 'PURCHASE' as type, id, reference as title, status as subtitle FROM purchases WHERE company_id = $1 AND reference ILIKE $2 LIMIT $3`,
      [companyId, term, limit],
    );

    return {
      query,
      results: [
        ...customers,
        ...suppliers,
        ...materials,
        ...products,
        ...sales,
        ...purchases,
      ],
    };
  }

  async searchMaterials(companyId: string, query: string, uomId?: string) {
    const term = `%${query.trim()}%`;
    return this.dataSource.query(
      `SELECT rm.id as material_id, rm.name as material_name, rmv.id as variant_id, rmv.name as variant_name, rmv.sku 
       FROM raw_material_variants rmv 
       JOIN raw_materials rm ON rmv.raw_material_id = rm.id 
       WHERE rmv.company_id = $1 
       AND (rm.name ILIKE $2 OR rmv.name ILIKE $2 OR rmv.sku ILIKE $2) 
       AND ($3::uuid IS NULL OR rm.base_uom_id = $3::uuid)`,
      [companyId, term, uomId || null],
    );
  }

  async searchProducts(companyId: string, query: string) {
    const term = `%${query.trim()}%`;
    return this.dataSource.query(
      `SELECT fp.id as product_id, fp.name as product_name, fpv.id as variant_id, fpv.name as variant_name, fpv.sku, fpv.selling_price 
       FROM finished_product_variants fpv 
       JOIN finished_products fp ON fpv.product_id = fp.id 
       WHERE fpv.company_id = $1 
       AND (fp.name ILIKE $2 OR fpv.name ILIKE $2 OR fpv.sku ILIKE $2)`,
      [companyId, term],
    );
  }

  async searchTransactions(companyId: string, query: string, type?: string) {
    const term = `%${query.trim()}%`;
    const results: any[] = [];

    if (!type || type === 'PURCHASE') {
      const purchases = await this.dataSource.query(
        `SELECT 'PURCHASE' as type, id, reference, purchase_date as date, total_amount as amount, status FROM purchases WHERE company_id = $1 AND reference ILIKE $2`,
        [companyId, term],
      );
      results.push(...purchases);
    }

    if (!type || type === 'SALE') {
      const sales = await this.dataSource.query(
        `SELECT 'SALE' as type, id, reference, sale_date as date, total_amount as amount, status FROM sales WHERE company_id = $1 AND reference ILIKE $2`,
        [companyId, term],
      );
      results.push(...sales);
    }

    if (!type || type === 'PRODUCTION') {
      const productions = await this.dataSource.query(
        `SELECT 'PRODUCTION' as type, id, reference, production_date as date, total_material_cost as amount, status FROM productions WHERE company_id = $1 AND reference ILIKE $2`,
        [companyId, term],
      );
      results.push(...productions);
    }

    return { query, results };
  }
}
