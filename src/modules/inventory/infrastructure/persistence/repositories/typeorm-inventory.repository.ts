import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { RawMaterialStockEntity } from '../entities/raw-material-stock.entity';
import { InventoryMovementEntity } from '../entities/inventory-movement.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { IInventoryRepository } from '../../../domain/repositories/inventory.repository.interface';
import { PaginationQueryDto } from '../../../../../common/dtos/pagination.dto';

@Injectable()
export class TypeOrmInventoryRepository implements IInventoryRepository {
  constructor(
    @InjectRepository(RawMaterialStockEntity)
    private readonly stockRepo: Repository<RawMaterialStockEntity>,
    @InjectRepository(InventoryMovementEntity)
    private readonly movementRepo: Repository<InventoryMovementEntity>,
    @InjectRepository(StockAdjustmentEntity)
    private readonly adjRepo: Repository<StockAdjustmentEntity>,
  ) {}

  async findStockAndCount(companyId: string, pagination: PaginationQueryDto): Promise<[RawMaterialStockEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    return this.stockRepo.findAndCount({
      where: { companyId },
      relations: ['variant', 'variant.rawMaterial', 'variant.rawMaterial.baseUom'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findStockByVariant(companyId: string, variantId: string, manager?: EntityManager): Promise<RawMaterialStockEntity | null> {
    const repo = manager ? manager.getRepository(RawMaterialStockEntity) : this.stockRepo;
    return repo.findOne({ where: { companyId, variantId } });
  }

  async saveStock(stock: Partial<RawMaterialStockEntity>, manager?: EntityManager): Promise<RawMaterialStockEntity> {
    const repo = manager ? manager.getRepository(RawMaterialStockEntity) : this.stockRepo;
    return repo.save(stock as any);
  }

  async findMovementsAndCount(companyId: string, variantId: string, pagination: PaginationQueryDto): Promise<[InventoryMovementEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'movementDate', sortOrder = 'DESC' } = pagination;
    return this.movementRepo.findAndCount({
      where: { companyId, variantId },
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async saveMovement(movement: Partial<InventoryMovementEntity>, manager?: EntityManager): Promise<InventoryMovementEntity> {
    const repo = manager ? manager.getRepository(InventoryMovementEntity) : this.movementRepo;
    return repo.save(movement as any);
  }

  async findAdjustmentsAndCount(companyId: string, pagination: PaginationQueryDto): Promise<[StockAdjustmentEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    return this.adjRepo.findAndCount({
      where: { companyId },
      relations: ['variant'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findAdjustmentById(companyId: string, id: string): Promise<StockAdjustmentEntity | null> {
    return this.adjRepo.findOne({ where: { id, companyId } });
  }

  async saveAdjustment(adjustment: Partial<StockAdjustmentEntity>, manager?: EntityManager): Promise<StockAdjustmentEntity> {
    const repo = manager ? manager.getRepository(StockAdjustmentEntity) : this.adjRepo;
    return repo.save(adjustment as any);
  }
}
