import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ProductionEntity } from '../../infrastructure/persistence/entities/production.entity';
import { ProductionBatchEntity } from '../../infrastructure/persistence/entities/production-batch.entity';
import { ProductionConsumptionEntity } from '../../infrastructure/persistence/entities/production-consumption.entity';
import { BatchStatus } from '../../domain/enums/production.enums';
import { TransactionStatus } from '../../../../common/enums/transaction-status.enum';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateProductionDto, CancelProductionDto } from '../../presentation/dtos/production.dto';
import { IProductionRepository, PRODUCTION_REPOSITORY_TOKEN } from '../../domain/repositories/production.repository.interface';
import { InventoryService } from '../../../inventory/application/services/inventory.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(PRODUCTION_REPOSITORY_TOKEN)
    private readonly productionRepo: IProductionRepository,
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
    private readonly outboxService: OutboxService,
  ) {}

  async listProductions(companyId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.productionRepo.findProductionsAndCount(companyId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async getProduction(companyId: string, id: string): Promise<ProductionEntity> {
    const production = await this.productionRepo.findProductionById(companyId, id);
    if (!production) throw new NotFoundException('Production record not found');
    return production;
  }

  async getBatch(companyId: string, batchId: string): Promise<ProductionBatchEntity> {
    const batch = await this.productionRepo.findBatchById(companyId, batchId);
    if (!batch) throw new NotFoundException('Production batch not found');
    return batch;
  }

  async createProduction(companyId: string, userId: string, dto: CreateProductionDto): Promise<ProductionEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalMaterialCost = 0;
      const consumptions: ProductionConsumptionEntity[] = [];

      for (const item of dto.consumptions) {
        // Delegate raw material stock deduction to authoritative InventoryService
        const { unitCost, totalCost } = await this.inventoryService.consumeStock(
          companyId,
          item.rawMaterialVariantId,
          Number(item.actualQuantity),
          'PENDING_PRODUCTION',
          'PRODUCTION',
          queryRunner.manager,
        );

        totalMaterialCost += totalCost;

        consumptions.push(
          queryRunner.manager.create(ProductionConsumptionEntity, {
            rawMaterialVariantId: item.rawMaterialVariantId,
            expectedQuantity: item.expectedQuantity,
            actualQuantity: item.actualQuantity,
            baseQuantity: item.baseQuantity || item.actualQuantity,
            uomId: item.uomId,
            unitCost,
            totalCost,
            expiryDate: item.expiryDate,
          }),
        );
      }

      const goodOutput = Number(dto.goodOutput);
      const unitProductionCost = goodOutput > 0 ? totalMaterialCost / goodOutput : 0;
      const reference = `PRD-${Date.now()}`;
      const batchNumber = `BAT-${Date.now()}`;

      const production = queryRunner.manager.create(ProductionEntity, {
        companyId,
        reference,
        finishedProductVariantId: dto.finishedProductVariantId,
        bomId: dto.bomId,
        financialYearId: dto.financialYearId,
        productionDate: dto.productionDate || new Date(),
        plannedQuantity: dto.plannedQuantity,
        goodOutput,
        rejectedOutput: dto.rejectedOutput || 0,
        wastage: dto.wastage || 0,
        varianceReason: dto.varianceReason,
        totalMaterialCost,
        unitProductionCost,
        status: TransactionStatus.CONFIRMED,
        confirmedBy: userId,
        consumptions,
      });

      const savedProd = await this.productionRepo.saveProduction(production, queryRunner.manager);

      // Create sellable batch owned by Production domain
      const batch = queryRunner.manager.create(ProductionBatchEntity, {
        companyId,
        productionId: savedProd.id,
        batchNumber,
        finishedProductVariantId: dto.finishedProductVariantId,
        goodOutput,
        availableQuantity: goodOutput,
        expiryDate: dto.expiryDate,
        batchUnitCost: unitProductionCost,
        totalMaterialCost,
        status: BatchStatus.AVAILABLE,
      });
      await this.productionRepo.saveBatch(batch, queryRunner.manager);

      // Transactional Outbox event
      await this.outboxService.enqueue(
        companyId,
        EventTopics.PRODUCTION_EVENTS,
        DomainEvents.PRODUCTION_CONFIRMED,
        {
          companyId,
          productionId: savedProd.id,
          batchNumber,
          goodOutput,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return savedProd;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelProduction(companyId: string, id: string, dto: CancelProductionDto): Promise<ProductionEntity> {
    const production = await this.getProduction(companyId, id);
    if (production.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Production run is already cancelled');
    }

    if (production.batch && Number(production.batch.availableQuantity) < Number(production.batch.goodOutput)) {
      throw new BadRequestException('Cannot cancel production run: finished goods from this batch have already been sold');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Revert raw material consumptions through InventoryService
      for (const c of production.consumptions) {
        await this.inventoryService.revertConsumptionStock(
          companyId,
          c.rawMaterialVariantId,
          Number(c.actualQuantity),
          Number(c.unitCost),
          production.id,
          'PRODUCTION_CANCEL',
          queryRunner.manager,
        );
      }

      // Deplete or mark batch cancelled
      if (production.batch) {
        production.batch.availableQuantity = 0;
        production.batch.status = BatchStatus.DEPLETED;
        await this.productionRepo.saveBatch(production.batch, queryRunner.manager);
      }

      production.status = TransactionStatus.CANCELLED;
      production.cancellationReason = dto.reason;
      production.cancelledAt = new Date();
      const savedProd = await this.productionRepo.saveProduction(production, queryRunner.manager);

      await this.outboxService.enqueue(
        companyId,
        EventTopics.PRODUCTION_EVENTS,
        DomainEvents.PRODUCTION_CANCELLED,
        { companyId, productionId: id, reason: dto.reason },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return savedProd;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // =========================================================================
  // APPLICATION INTER-MODULE CONTRACTS
  // (Authoritative owner of Finished Good Batches)
  // =========================================================================

  /**
   * Called by Sales domain to allocate stock from a finished product batch.
   */
  async allocateBatch(
    companyId: string,
    batchId: string,
    quantity: number,
    manager?: EntityManager,
  ): Promise<ProductionBatchEntity> {
    const mgr = manager || this.dataSource.manager;
    const batch = await this.productionRepo.findBatchById(companyId, batchId, mgr);
    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    const available = Number(batch.availableQuantity);
    const reqQty = Number(quantity);

    if (available < reqQty) {
      throw new BadRequestException(`Insufficient batch stock. Available: ${available}, Requested: ${reqQty}`);
    }

    batch.availableQuantity = available - reqQty;
    if (batch.availableQuantity === 0) {
      batch.status = BatchStatus.DEPLETED;
    }

    return this.productionRepo.saveBatch(batch, mgr);
  }

  /**
   * Called by Sales domain to allocate stock from available finished product batches (FEFO / FIFO).
   */
  async allocateProductBatches(
    companyId: string,
    finishedProductVariantId: string,
    quantity: number,
    manager?: EntityManager,
  ): Promise<Array<{ batchId: string; quantity: number; batchUnitCost: number; allocatedCOGS: number }>> {
    const mgr = manager || this.dataSource.manager;
    const batches = await this.productionRepo.findAvailableBatches(companyId, finishedProductVariantId, mgr);
    let remainingToAllocate = Number(quantity);
    const allocations: Array<{ batchId: string; quantity: number; batchUnitCost: number; allocatedCOGS: number }> = [];

    for (const batch of batches) {
      if (remainingToAllocate <= 0) break;
      const availableInBatch = Number(batch.availableQuantity);
      const allocatedQty = Math.min(remainingToAllocate, availableInBatch);
      const batchUnitCost = Number(batch.batchUnitCost);
      const allocatedCOGS = allocatedQty * batchUnitCost;

      batch.availableQuantity = availableInBatch - allocatedQty;
      if (batch.availableQuantity === 0) {
        batch.status = BatchStatus.DEPLETED;
      }
      await this.productionRepo.saveBatch(batch, mgr);

      allocations.push({
        batchId: batch.id,
        quantity: allocatedQty,
        batchUnitCost,
        allocatedCOGS,
      });

      remainingToAllocate -= allocatedQty;
    }

    if (remainingToAllocate > 0) {
      throw new BadRequestException(
        `Insufficient available batch stock for product variant ${finishedProductVariantId}. Shortfall: ${remainingToAllocate}`,
      );
    }

    return allocations;
  }

  /**
   * Called by Sales domain when an order is cancelled or batch allocation is reverted.
   */
  async releaseBatchAllocation(
    companyId: string,
    batchId: string,
    quantity: number,
    manager?: EntityManager,
  ): Promise<ProductionBatchEntity> {
    const mgr = manager || this.dataSource.manager;
    const batch = await this.productionRepo.findBatchById(companyId, batchId, mgr);
    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    const available = Number(batch.availableQuantity);
    batch.availableQuantity = available + Number(quantity);
    if (batch.availableQuantity > 0 && batch.status === BatchStatus.DEPLETED) {
      batch.status = BatchStatus.AVAILABLE;
    }

    return this.productionRepo.saveBatch(batch, mgr);
  }
}
