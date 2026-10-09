import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ProductionEntity } from '../entities/production.entity';
import { ProductionBatchEntity } from '../entities/production-batch.entity';
import { BatchStatus } from '../../../domain/enums/production.enums';
import { IProductionRepository } from '../../../domain/repositories/production.repository.interface';
import { PaginationQueryDto } from '../../../../../common/dtos/pagination.dto';

@Injectable()
export class TypeOrmProductionRepository implements IProductionRepository {
  constructor(
    @InjectRepository(ProductionEntity)
    private readonly prodRepo: Repository<ProductionEntity>,
    @InjectRepository(ProductionBatchEntity)
    private readonly batchRepo: Repository<ProductionBatchEntity>,
  ) {}

  async findProductionsAndCount(companyId: string, pagination: PaginationQueryDto): Promise<[ProductionEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    return this.prodRepo.findAndCount({
      where: { companyId },
      relations: ['variant', 'bom', 'batch', 'consumptions', 'consumptions.variant'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findProductionById(companyId: string, id: string): Promise<ProductionEntity | null> {
    return this.prodRepo.findOne({
      where: { id, companyId },
      relations: ['variant', 'bom', 'batch', 'consumptions', 'consumptions.variant'],
    });
  }

  async findBatchById(companyId: string, batchId: string, manager?: EntityManager): Promise<ProductionBatchEntity | null> {
    const repo = manager ? manager.getRepository(ProductionBatchEntity) : this.batchRepo;
    return repo.findOne({
      where: { id: batchId, companyId },
      relations: ['variant', 'production'],
    });
  }

  async findAvailableBatches(
    companyId: string,
    finishedProductVariantId: string,
    manager?: EntityManager,
  ): Promise<ProductionBatchEntity[]> {
    const repo = manager ? manager.getRepository(ProductionBatchEntity) : this.batchRepo;
    return repo.find({
      where: {
        companyId,
        finishedProductVariantId,
        status: BatchStatus.AVAILABLE,
      },
      order: { expiryDate: 'ASC', createdAt: 'ASC' }, // FEFO / FIFO
    });
  }

  async saveProduction(production: Partial<ProductionEntity>, manager?: EntityManager): Promise<ProductionEntity> {
    const repo = manager ? manager.getRepository(ProductionEntity) : this.prodRepo;
    return repo.save(production as any);
  }

  async saveBatch(batch: Partial<ProductionBatchEntity>, manager?: EntityManager): Promise<ProductionBatchEntity> {
    const repo = manager ? manager.getRepository(ProductionBatchEntity) : this.batchRepo;
    return repo.save(batch as any);
  }
}
