import { EntityManager } from 'typeorm';
import { SaleEntity } from '../../infrastructure/persistence/entities/sale.entity';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

export const SALES_REPOSITORY_TOKEN = Symbol('SALES_REPOSITORY_TOKEN');

export interface ISalesRepository {
  findSalesAndCount(
    companyId: string,
    pagination: PaginationQueryDto,
  ): Promise<[SaleEntity[], number]>;

  findSaleById(
    companyId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<SaleEntity | null>;

  saveSale(
    sale: SaleEntity,
    manager?: EntityManager,
  ): Promise<SaleEntity>;
}
