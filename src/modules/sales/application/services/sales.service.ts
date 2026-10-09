import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SaleEntity } from '../../infrastructure/persistence/entities/sale.entity';
import { SaleLineEntity } from '../../infrastructure/persistence/entities/sale-line.entity';
import { SaleBatchAllocationEntity } from '../../infrastructure/persistence/entities/sale-batch-allocation.entity';
import { PaymentState } from '../../domain/enums/sales.enums';
import { TransactionStatus } from '../../../../common/enums/transaction-status.enum';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateSaleDto, CancelSaleDto } from '../../presentation/dtos/sales.dto';
import { ISalesRepository, SALES_REPOSITORY_TOKEN } from '../../domain/repositories/sales.repository.interface';
import { ProductionService } from '../../../production/application/services/production.service';
import { CustomersService } from '../../../customers/application/services/customers.service';
import { AttachmentEntity, AttachmentReferenceType } from '../../../../infrastructure/storage/attachment.entity';

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY_TOKEN)
    private readonly saleRepo: ISalesRepository,
    @InjectRepository(AttachmentEntity)
    private readonly attachRepo: Repository<AttachmentEntity>,
    private readonly productionService: ProductionService,
    private readonly customersService: CustomersService,
    private readonly dataSource: DataSource,
    private readonly outboxService: OutboxService,
  ) {}

  async listSales(companyId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.saleRepo.findSalesAndCount(companyId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async getSale(companyId: string, id: string): Promise<SaleEntity> {
    const sale = await this.saleRepo.findSaleById(companyId, id);
    if (!sale) throw new NotFoundException('Sale invoice not found');
    return sale;
  }

  async createSale(companyId: string, userId: string, dto: CreateSaleDto): Promise<SaleEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let taxableAmount = 0;
      let totalCOGS = 0;
      const lines: SaleLineEntity[] = [];

      for (const item of dto.lines) {
        const lineTotal = Number(item.quantity) * Number(item.sellingPrice);
        taxableAmount += lineTotal;

        // Allocate batches through ProductionService application contract
        const batchAllocationsData = await this.productionService.allocateProductBatches(
          companyId,
          item.finishedProductVariantId,
          Number(item.quantity),
          queryRunner.manager,
        );

        const allocations: SaleBatchAllocationEntity[] = [];
        for (const allocData of batchAllocationsData) {
          totalCOGS += allocData.allocatedCOGS;
          allocations.push(
            queryRunner.manager.create(SaleBatchAllocationEntity, {
              batchId: allocData.batchId,
              quantity: allocData.quantity,
              batchUnitCost: allocData.batchUnitCost,
              allocatedCOGS: allocData.allocatedCOGS,
            }),
          );
        }

        lines.push(
          queryRunner.manager.create(SaleLineEntity, {
            finishedProductVariantId: item.finishedProductVariantId,
            quantity: item.quantity,
            baseQuantity: item.baseQuantity || item.quantity,
            uomId: item.uomId,
            sellingPrice: item.sellingPrice,
            lineTotal,
            batchAllocations: allocations,
          }),
        );
      }

      const totalAmount =
        taxableAmount +
        Number(dto.cgstAmount || 0) +
        Number(dto.sgstAmount || 0) +
        Number(dto.igstAmount || 0);

      const amountPaid = Number(dto.amountPaid || 0);

      let paymentState = PaymentState.CREDIT;
      if (amountPaid >= totalAmount) paymentState = PaymentState.FULL;
      else if (amountPaid > 0) paymentState = PaymentState.PARTIAL;

      const reference = `SAL-${Date.now()}`;
      const sale = queryRunner.manager.create(SaleEntity, {
        companyId,
        reference,
        customerId: dto.customerId,
        financialYearId: dto.financialYearId,
        saleDate: dto.saleDate || new Date(),
        gstConfigId: dto.gstConfigId,
        taxableAmount,
        cgstAmount: dto.cgstAmount || 0,
        sgstAmount: dto.sgstAmount || 0,
        igstAmount: dto.igstAmount || 0,
        totalAmount,
        estimatedCOGS: totalCOGS,
        paymentState,
        amountPaid,
        paymentMethod: dto.paymentMethod,
        paymentDate: amountPaid > 0 ? new Date() : undefined,
        status: TransactionStatus.CONFIRMED,
        confirmedBy: userId,
        lines,
      });

      const savedSale = await this.saleRepo.saveSale(sale, queryRunner.manager);

      // Update Customer Outstanding Balance via CustomersService application contract
      const unpaidBalance = totalAmount - amountPaid;
      if (unpaidBalance > 0) {
        await this.customersService.adjustBalance(companyId, dto.customerId, unpaidBalance, queryRunner.manager);
      }

      // Transactional Outbox Event
      await this.outboxService.enqueue(
        companyId,
        EventTopics.SALE_EVENTS,
        DomainEvents.SALE_CONFIRMED,
        {
          companyId,
          saleId: savedSale.id,
          customerId: dto.customerId,
          totalAmount,
          estimatedCOGS: totalCOGS,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return savedSale;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelSale(companyId: string, id: string, dto: CancelSaleDto): Promise<SaleEntity> {
    const sale = await this.getSale(companyId, id);
    if (sale.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Sale invoice is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Revert batch allocations via ProductionService contract
      for (const line of sale.lines) {
        for (const alloc of line.batchAllocations) {
          await this.productionService.releaseBatchAllocation(
            companyId,
            alloc.batchId,
            Number(alloc.quantity),
            queryRunner.manager,
          );
        }
      }

      // Revert Customer Balance via CustomersService contract
      const unpaidBalance = Number(sale.totalAmount) - Number(sale.amountPaid);
      if (unpaidBalance > 0) {
        await this.customersService.adjustBalance(companyId, sale.customerId, -unpaidBalance, queryRunner.manager);
      }

      sale.status = TransactionStatus.CANCELLED;
      sale.cancellationReason = dto.reason;
      sale.cancelledAt = new Date();
      const savedSale = await this.saleRepo.saveSale(sale, queryRunner.manager);

      await this.outboxService.enqueue(
        companyId,
        EventTopics.SALE_EVENTS,
        DomainEvents.SALE_CANCELLED,
        { companyId, saleId: id, reason: dto.reason },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return savedSale;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async uploadAttachment(companyId: string, userId: string, saleId: string, file: any) {
    const attach = this.attachRepo.create({
      companyId,
      referenceId: saleId,
      referenceType: AttachmentReferenceType.SALE,
      originalFilename: file.originalname,
      storagePath: file.path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: userId,
    });
    return this.attachRepo.save(attach);
  }
}
