import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RawMaterialStockEntity } from '../../infrastructure/persistence/entities/raw-material-stock.entity';
import { InventoryMovementEntity } from '../../infrastructure/persistence/entities/inventory-movement.entity';
import { StockAdjustmentEntity } from '../../infrastructure/persistence/entities/stock-adjustment.entity';
import { InventoryMovementType, AdjustmentType } from '../../domain/enums/inventory.enums';
import { TransactionStatus } from '../../../../common/enums/transaction-status.enum';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateStockAdjustmentDto, CancelStockAdjustmentDto } from '../../presentation/dtos/inventory.dto';
import { IInventoryRepository, INVENTORY_REPOSITORY_TOKEN } from '../../domain/repositories/inventory.repository.interface';
import { InsufficientStockException } from '../../../../common/exceptions/domain.exception';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_REPOSITORY_TOKEN)
    private readonly inventoryRepo: IInventoryRepository,
    private readonly dataSource: DataSource,
    private readonly outboxService: OutboxService,
  ) {}

  async getRawMaterialStock(companyId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.inventoryRepo.findStockAndCount(companyId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async getMovements(companyId: string, variantId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.inventoryRepo.findMovementsAndCount(companyId, variantId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async listAdjustments(companyId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.inventoryRepo.findAdjustmentsAndCount(companyId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async createStockAdjustment(companyId: string, userId: string, dto: CreateStockAdjustmentDto): Promise<StockAdjustmentEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let stock = await this.inventoryRepo.findStockByVariant(companyId, dto.variantId, queryRunner.manager);

      if (!stock) {
        stock = queryRunner.manager.create(RawMaterialStockEntity, {
          companyId,
          variantId: dto.variantId,
          usableQuantity: 0,
          weightedAverageCost: 0,
        });
      }

      const currentQty = Number(stock.usableQuantity);
      const adjQty = Number(dto.adjustmentQuantity);

      let newQty = currentQty;
      let unitCost = Number(stock.weightedAverageCost);

      if (dto.type === AdjustmentType.POSITIVE) {
        if (!dto.unitCost || Number(dto.unitCost) <= 0) {
          throw new BadRequestException('Unit cost is required for positive stock adjustment');
        }
        unitCost = Number(dto.unitCost);
        newQty = currentQty + adjQty;

        // Recalculate Weighted Average Cost (WAC)
        const oldTotalCost = currentQty * Number(stock.weightedAverageCost);
        const newAddCost = adjQty * unitCost;
        stock.weightedAverageCost = newQty > 0 ? (oldTotalCost + newAddCost) / newQty : unitCost;
      } else {
        if (currentQty < adjQty) {
          throw new InsufficientStockException(dto.variantId, currentQty, adjQty);
        }
        newQty = currentQty - adjQty;
      }

      stock.usableQuantity = newQty;
      await this.inventoryRepo.saveStock(stock, queryRunner.manager);

      const reference = `ADJ-${Date.now()}`;
      const adjustment = queryRunner.manager.create(StockAdjustmentEntity, {
        companyId,
        reference,
        variantId: dto.variantId,
        type: dto.type,
        quantityBefore: currentQty,
        adjustmentQuantity: adjQty,
        quantityAfter: newQty,
        unitCost,
        reason: dto.reason,
        adjustedBy: userId,
        financialYearId: dto.financialYearId,
        status: TransactionStatus.CONFIRMED,
      });

      const savedAdj = await this.inventoryRepo.saveAdjustment(adjustment, queryRunner.manager);

      // Create Movement Entry
      const movement = queryRunner.manager.create(InventoryMovementEntity, {
        companyId,
        variantId: dto.variantId,
        movementType: dto.type === AdjustmentType.POSITIVE ? InventoryMovementType.ADJUSTMENT_IN : InventoryMovementType.ADJUSTMENT_OUT,
        quantityChange: dto.type === AdjustmentType.POSITIVE ? adjQty : -adjQty,
        unitCost,
        referenceId: savedAdj.id,
        referenceType: 'STOCK_ADJUSTMENT',
        movementDate: new Date(),
      });
      await this.inventoryRepo.saveMovement(movement, queryRunner.manager);

      await this.outboxService.enqueue(
        companyId,
        EventTopics.INVENTORY_EVENTS,
        DomainEvents.STOCK_ADJUSTED,
        {
          companyId,
          variantId: dto.variantId,
          type: dto.type,
          quantity: adjQty,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return savedAdj;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelStockAdjustment(companyId: string, userId: string, id: string, dto: CancelStockAdjustmentDto): Promise<StockAdjustmentEntity> {
    const adj = await this.inventoryRepo.findAdjustmentById(companyId, id);
    if (!adj) throw new NotFoundException('Stock adjustment not found');
    if (adj.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Stock adjustment is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stock = await this.inventoryRepo.findStockByVariant(companyId, adj.variantId, queryRunner.manager);
      if (!stock) throw new NotFoundException('Stock record not found');

      const currentQty = Number(stock.usableQuantity);
      const adjQty = Number(adj.adjustmentQuantity);

      // Reverse stock change
      if (adj.type === AdjustmentType.POSITIVE) {
        if (currentQty < adjQty) {
          throw new BadRequestException('Cannot cancel adjustment: insufficient stock to reverse positive adjustment');
        }
        stock.usableQuantity = currentQty - adjQty;
      } else {
        stock.usableQuantity = currentQty + adjQty;
      }

      await this.inventoryRepo.saveStock(stock, queryRunner.manager);

      adj.status = TransactionStatus.CANCELLED;
      adj.cancellationReason = dto.reason;
      adj.cancelledAt = new Date();
      adj.cancelledBy = userId;
      const savedAdj = await this.inventoryRepo.saveAdjustment(adj, queryRunner.manager);

      // Add Reversal Movement
      const movement = queryRunner.manager.create(InventoryMovementEntity, {
        companyId,
        variantId: adj.variantId,
        movementType: InventoryMovementType.CANCELLATION_REVERSE,
        quantityChange: adj.type === AdjustmentType.POSITIVE ? -adjQty : adjQty,
        unitCost: Number(adj.unitCost || stock.weightedAverageCost),
        referenceId: savedAdj.id,
        referenceType: 'STOCK_ADJUSTMENT_CANCEL',
        movementDate: new Date(),
      });
      await this.inventoryRepo.saveMovement(movement, queryRunner.manager);

      await this.outboxService.enqueue(
        companyId,
        EventTopics.INVENTORY_EVENTS,
        DomainEvents.STOCK_ADJUSTMENT_CANCELLED,
        { companyId, adjId: id },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return savedAdj;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // =========================================================================
  // APPLICATION INTER-MODULE CONTRACTS
  // (Authoritative owner of raw material inventory)
  // =========================================================================

  async getStock(companyId: string, variantId: string, manager?: EntityManager): Promise<RawMaterialStockEntity | null> {
    return this.inventoryRepo.findStockByVariant(companyId, variantId, manager);
  }

  /**
   * Called by Purchases when purchase items are received into inventory.
   * Updates usable stock and recalculates Weighted Average Cost (WAC).
   */
  async receiveStock(
    companyId: string,
    variantId: string,
    quantity: number,
    unitCost: number,
    referenceId: string,
    referenceType: string,
    manager?: EntityManager,
  ): Promise<RawMaterialStockEntity> {
    const mgr = manager || this.dataSource.manager;
    let stock = await this.inventoryRepo.findStockByVariant(companyId, variantId, mgr);

    if (!stock) {
      stock = mgr.create(RawMaterialStockEntity, {
        companyId,
        variantId,
        usableQuantity: 0,
        weightedAverageCost: 0,
      });
    }

    const currentQty = Number(stock.usableQuantity);
    const inQty = Number(quantity);
    const cost = Number(unitCost);
    const newQty = currentQty + inQty;

    const oldTotal = currentQty * Number(stock.weightedAverageCost);
    const newAdd = inQty * cost;
    stock.weightedAverageCost = newQty > 0 ? (oldTotal + newAdd) / newQty : cost;
    stock.usableQuantity = newQty;

    const savedStock = await this.inventoryRepo.saveStock(stock, mgr);

    // Record Movement
    const movement = mgr.create(InventoryMovementEntity, {
      companyId,
      variantId,
      movementType: InventoryMovementType.PURCHASE_IN,
      quantityChange: inQty,
      unitCost: cost,
      referenceId,
      referenceType,
      movementDate: new Date(),
    });
    await this.inventoryRepo.saveMovement(movement, mgr);

    return savedStock;
  }

  /**
   * Called by Production when raw materials are consumed for finished goods output.
   * Verifies stock availability, decrements usable stock, and records consumption movement.
   */
  async consumeStock(
    companyId: string,
    variantId: string,
    quantity: number,
    referenceId: string,
    referenceType: string,
    manager?: EntityManager,
  ): Promise<{ consumedQuantity: number; unitCost: number; totalCost: number }> {
    const mgr = manager || this.dataSource.manager;
    const stock = await this.inventoryRepo.findStockByVariant(companyId, variantId, mgr);

    const availableQty = stock ? Number(stock.usableQuantity) : 0;
    const reqQty = Number(quantity);

    if (availableQty < reqQty) {
      throw new InsufficientStockException(variantId, availableQty, reqQty);
    }

    const unitCost = stock ? Number(stock.weightedAverageCost) : 0;
    const totalCost = reqQty * unitCost;

    stock!.usableQuantity = availableQty - reqQty;
    await this.inventoryRepo.saveStock(stock!, mgr);

    // Record OUT Movement
    const movement = mgr.create(InventoryMovementEntity, {
      companyId,
      variantId,
      movementType: InventoryMovementType.PRODUCTION_CONSUMPTION_OUT,
      quantityChange: -reqQty,
      unitCost,
      referenceId,
      referenceType,
      movementDate: new Date(),
    });
    await this.inventoryRepo.saveMovement(movement, mgr);

    return { consumedQuantity: reqQty, unitCost, totalCost };
  }

  /**
   * Called by Production when a production run is cancelled.
   * Restores consumed raw material stock and logs reversal movement.
   */
  async revertConsumptionStock(
    companyId: string,
    variantId: string,
    quantity: number,
    unitCost: number,
    referenceId: string,
    referenceType: string,
    manager?: EntityManager,
  ): Promise<RawMaterialStockEntity> {
    const mgr = manager || this.dataSource.manager;
    let stock = await this.inventoryRepo.findStockByVariant(companyId, variantId, mgr);

    if (!stock) {
      stock = mgr.create(RawMaterialStockEntity, {
        companyId,
        variantId,
        usableQuantity: 0,
        weightedAverageCost: unitCost,
      });
    }

    stock.usableQuantity = Number(stock.usableQuantity) + Number(quantity);
    const savedStock = await this.inventoryRepo.saveStock(stock, mgr);

    const movement = mgr.create(InventoryMovementEntity, {
      companyId,
      variantId,
      movementType: InventoryMovementType.CANCELLATION_REVERSE,
      quantityChange: Number(quantity),
      unitCost: Number(unitCost),
      referenceId,
      referenceType,
      movementDate: new Date(),
    });
    await this.inventoryRepo.saveMovement(movement, mgr);

    return savedStock;
  }
}
