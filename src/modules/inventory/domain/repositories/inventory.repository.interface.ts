import { EntityManager } from 'typeorm';
import { RawMaterialStockEntity } from '../../infrastructure/persistence/entities/raw-material-stock.entity';
import { InventoryMovementEntity } from '../../infrastructure/persistence/entities/inventory-movement.entity';
import { StockAdjustmentEntity } from '../../infrastructure/persistence/entities/stock-adjustment.entity';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

export interface IInventoryRepository {
  findStockAndCount(companyId: string, pagination: PaginationQueryDto): Promise<[RawMaterialStockEntity[], number]>;
  findStockByVariant(companyId: string, variantId: string, manager?: EntityManager): Promise<RawMaterialStockEntity | null>;
  saveStock(stock: Partial<RawMaterialStockEntity>, manager?: EntityManager): Promise<RawMaterialStockEntity>;
  findMovementsAndCount(companyId: string, variantId: string, pagination: PaginationQueryDto): Promise<[InventoryMovementEntity[], number]>;
  saveMovement(movement: Partial<InventoryMovementEntity>, manager?: EntityManager): Promise<InventoryMovementEntity>;
  findAdjustmentsAndCount(companyId: string, pagination: PaginationQueryDto): Promise<[StockAdjustmentEntity[], number]>;
  findAdjustmentById(companyId: string, id: string): Promise<StockAdjustmentEntity | null>;
  saveAdjustment(adjustment: Partial<StockAdjustmentEntity>, manager?: EntityManager): Promise<StockAdjustmentEntity>;
}

export const INVENTORY_REPOSITORY_TOKEN = 'IInventoryRepository';
