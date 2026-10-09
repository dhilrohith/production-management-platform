import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PurchaseEntity } from '../../infrastructure/persistence/entities/purchase.entity';
import { PurchaseLineEntity } from '../../infrastructure/persistence/entities/purchase-line.entity';
import { PaymentState } from '../../domain/enums/purchases.enums';
import { TransactionStatus } from '../../../../common/enums/transaction-status.enum';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreatePurchaseDto, CancelPurchaseDto } from '../../presentation/dtos/purchases.dto';
import { IPurchasesRepository, PURCHASES_REPOSITORY_TOKEN } from '../../domain/repositories/purchases.repository.interface';
import { InventoryService } from '../../../inventory/application/services/inventory.service';
import { SuppliersService } from '../../../suppliers/application/services/suppliers.service';
import { AttachmentEntity, AttachmentReferenceType } from '../../../../infrastructure/storage/attachment.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @Inject(PURCHASES_REPOSITORY_TOKEN)
    private readonly purchaseRepo: IPurchasesRepository,
    @InjectRepository(AttachmentEntity)
    private readonly attachRepo: Repository<AttachmentEntity>,
    private readonly inventoryService: InventoryService,
    private readonly suppliersService: SuppliersService,
    private readonly dataSource: DataSource,
    private readonly outboxService: OutboxService,
  ) {}

  async listPurchases(companyId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.purchaseRepo.findPurchasesAndCount(companyId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async getPurchase(companyId: string, id: string): Promise<PurchaseEntity> {
    const purchase = await this.purchaseRepo.findPurchaseById(companyId, id);
    if (!purchase) throw new NotFoundException('Purchase transaction not found');
    return purchase;
  }

  async createPurchase(companyId: string, userId: string, dto: CreatePurchaseDto): Promise<PurchaseEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reference = `PUR-${Date.now()}`;
      let taxableAmount = 0;

      const lines = dto.lines.map((l) => {
        const lineTotal = Number(l.quantity) * Number(l.unitPrice);
        taxableAmount += lineTotal;
        return queryRunner.manager.create(PurchaseLineEntity, {
          rawMaterialVariantId: l.rawMaterialVariantId,
          quantity: l.quantity,
          baseQuantity: l.baseQuantity || l.quantity,
          uomId: l.uomId,
          unitPrice: l.unitPrice,
          lineTotal,
          expiryDate: l.expiryDate,
        });
      });

      const totalAmount =
        taxableAmount +
        Number(dto.cgstAmount || 0) +
        Number(dto.sgstAmount || 0) +
        Number(dto.igstAmount || 0);

      const amountPaid = Number(dto.amountPaid || 0);

      let paymentState = PaymentState.CREDIT;
      if (amountPaid >= totalAmount) paymentState = PaymentState.FULL;
      else if (amountPaid > 0) paymentState = PaymentState.PARTIAL;

      const purchase = queryRunner.manager.create(PurchaseEntity, {
        companyId,
        reference,
        supplierId: dto.supplierId,
        financialYearId: dto.financialYearId,
        purchaseDate: dto.purchaseDate || new Date(),
        gstConfigId: dto.gstConfigId,
        taxableAmount,
        cgstAmount: dto.cgstAmount || 0,
        sgstAmount: dto.sgstAmount || 0,
        igstAmount: dto.igstAmount || 0,
        totalAmount,
        paymentState,
        amountPaid,
        paymentMethod: dto.paymentMethod,
        paymentDate: amountPaid > 0 ? new Date() : undefined,
        status: TransactionStatus.CONFIRMED,
        confirmedBy: userId,
        lines,
      });

      const savedPurchase = await this.purchaseRepo.savePurchase(purchase, queryRunner.manager);

      // Stock In & Weighted Average Cost Update via InventoryService application interface
      for (const line of lines) {
        await this.inventoryService.receiveStock(
          companyId,
          line.rawMaterialVariantId,
          Number(line.baseQuantity),
          Number(line.unitPrice),
          savedPurchase.id,
          'PURCHASE',
          queryRunner.manager,
        );
      }

      // Update Supplier Outstanding Balance via SuppliersService application interface
      const unpaidBalance = totalAmount - amountPaid;
      if (unpaidBalance > 0) {
        await this.suppliersService.adjustBalance(companyId, dto.supplierId, unpaidBalance, queryRunner.manager);
      }

      // Transactional Outbox
      await this.outboxService.enqueue(
        companyId,
        EventTopics.PURCHASE_EVENTS,
        DomainEvents.PURCHASE_CONFIRMED,
        {
          companyId,
          purchaseId: savedPurchase.id,
          supplierId: dto.supplierId,
          totalAmount,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return savedPurchase;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelPurchase(companyId: string, id: string, dto: CancelPurchaseDto): Promise<PurchaseEntity> {
    const purchase = await this.getPurchase(companyId, id);
    if (purchase.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Purchase is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Reverse stock through InventoryService
      for (const line of purchase.lines) {
        await this.inventoryService.consumeStock(
          companyId,
          line.rawMaterialVariantId,
          Number(line.baseQuantity),
          purchase.id,
          'PURCHASE_CANCEL',
          queryRunner.manager,
        );
      }

      // Revert Supplier Balance through SuppliersService
      const unpaidBalance = Number(purchase.totalAmount) - Number(purchase.amountPaid);
      if (unpaidBalance > 0) {
        await this.suppliersService.adjustBalance(companyId, purchase.supplierId, -unpaidBalance, queryRunner.manager);
      }

      purchase.status = TransactionStatus.CANCELLED;
      purchase.cancellationReason = dto.reason;
      purchase.cancelledAt = new Date();
      const savedPurchase = await this.purchaseRepo.savePurchase(purchase, queryRunner.manager);

      await this.outboxService.enqueue(
        companyId,
        EventTopics.PURCHASE_EVENTS,
        DomainEvents.PURCHASE_CANCELLED,
        { companyId, purchaseId: id, reason: dto.reason },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return savedPurchase;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async uploadAttachment(companyId: string, userId: string, purchaseId: string, file: any) {
    const attach = this.attachRepo.create({
      companyId,
      referenceId: purchaseId,
      referenceType: AttachmentReferenceType.PURCHASE,
      originalFilename: file.originalname,
      storagePath: file.path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: userId,
    });
    return this.attachRepo.save(attach);
  }
}
