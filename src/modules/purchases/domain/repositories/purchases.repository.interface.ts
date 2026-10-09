import { EntityManager } from 'typeorm';
import { PurchaseEntity } from '../../infrastructure/persistence/entities/purchase.entity';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

export const PURCHASES_REPOSITORY_TOKEN = Symbol('PURCHASES_REPOSITORY_TOKEN');

export interface IPurchasesRepository {
  findPurchasesAndCount(
    companyId: string,
    pagination: PaginationQueryDto,
  ): Promise<[PurchaseEntity[], number]>;

  findPurchaseById(
    companyId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<PurchaseEntity | null>;

  savePurchase(
    purchase: PurchaseEntity,
    manager?: EntityManager,
  ): Promise<PurchaseEntity>;
}
