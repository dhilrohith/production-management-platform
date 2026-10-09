import { EntityManager } from 'typeorm';
import { ProductionEntity } from '../../infrastructure/persistence/entities/production.entity';
import { ProductionBatchEntity } from '../../infrastructure/persistence/entities/production-batch.entity';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

export interface IProductionRepository {
  findProductionsAndCount(companyId: string, pagination: PaginationQueryDto): Promise<[ProductionEntity[], number]>;
  findProductionById(companyId: string, id: string): Promise<ProductionEntity | null>;
  findBatchById(companyId: string, batchId: string, manager?: EntityManager): Promise<ProductionBatchEntity | null>;
  findAvailableBatches(companyId: string, finishedProductVariantId: string, manager?: EntityManager): Promise<ProductionBatchEntity[]>;
  saveProduction(production: Partial<ProductionEntity>, manager?: EntityManager): Promise<ProductionEntity>;
  saveBatch(batch: Partial<ProductionBatchEntity>, manager?: EntityManager): Promise<ProductionBatchEntity>;
}

export const PRODUCTION_REPOSITORY_TOKEN = 'IProductionRepository';
