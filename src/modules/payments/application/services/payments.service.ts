import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CustomerPaymentEntity } from '../../infrastructure/persistence/entities/customer-payment.entity';
import { SupplierPaymentEntity } from '../../infrastructure/persistence/entities/supplier-payment.entity';
import { TransactionStatus } from '../../../../common/enums/transaction-status.enum';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateCustomerPaymentDto,
  CancelCustomerPaymentDto,
  CreateSupplierPaymentDto,
  CancelSupplierPaymentDto,
} from '../../presentation/dtos/payments.dto';
import { IPaymentsRepository, PAYMENTS_REPOSITORY_TOKEN } from '../../domain/repositories/payments.repository.interface';
import { CustomersService } from '../../../customers/application/services/customers.service';
import { SuppliersService } from '../../../suppliers/application/services/suppliers.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENTS_REPOSITORY_TOKEN)
    private readonly paymentRepo: IPaymentsRepository,
    private readonly customersService: CustomersService,
    private readonly suppliersService: SuppliersService,
    private readonly dataSource: DataSource,
    private readonly outboxService: OutboxService,
  ) {}

  // =========================================================================
  // CUSTOMER PAYMENTS
  // =========================================================================

  async listCustomerPayments(companyId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.paymentRepo.findCustomerPaymentsAndCount(companyId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async getCustomerPayment(companyId: string, id: string): Promise<CustomerPaymentEntity> {
    const pmt = await this.paymentRepo.findCustomerPaymentById(companyId, id);
    if (!pmt) throw new NotFoundException('Customer payment record not found');
    return pmt;
  }

  async createCustomerPayment(
    companyId: string,
    userId: string,
    dto: CreateCustomerPaymentDto,
  ): Promise<CustomerPaymentEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const amount = Number(dto.amount);
      if (amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than zero');
      }

      // Adjust customer balance via CustomersService domain contract
      await this.customersService.adjustBalance(companyId, dto.customerId, -amount, queryRunner.manager);

      const reference = `CPMT-${Date.now()}`;
      const pmt = queryRunner.manager.create(CustomerPaymentEntity, {
        companyId,
        reference,
        customerId: dto.customerId,
        financialYearId: dto.financialYearId,
        amount,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.paymentDate || new Date(),
        status: TransactionStatus.CONFIRMED,
        confirmedBy: userId,
      });

      const saved = await this.paymentRepo.saveCustomerPayment(pmt, queryRunner.manager);

      // Transactional Outbox
      await this.outboxService.enqueue(
        companyId,
        EventTopics.PAYMENT_EVENTS,
        DomainEvents.CUSTOMER_PAYMENT_RECEIVED,
        {
          companyId,
          paymentId: saved.id,
          customerId: dto.customerId,
          amount,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelCustomerPayment(
    companyId: string,
    id: string,
    dto: CancelCustomerPaymentDto,
  ): Promise<CustomerPaymentEntity> {
    const pmt = await this.getCustomerPayment(companyId, id);
    if (pmt.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Payment is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Revert customer balance via CustomersService domain contract
      await this.customersService.adjustBalance(companyId, pmt.customerId, Number(pmt.amount), queryRunner.manager);

      pmt.status = TransactionStatus.CANCELLED;
      pmt.cancellationReason = dto.reason;
      pmt.cancelledAt = new Date();
      const saved = await this.paymentRepo.saveCustomerPayment(pmt, queryRunner.manager);

      await this.outboxService.enqueue(
        companyId,
        EventTopics.PAYMENT_EVENTS,
        DomainEvents.CUSTOMER_PAYMENT_CANCELLED,
        { companyId, paymentId: id, reason: dto.reason },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // =========================================================================
  // SUPPLIER PAYMENTS
  // =========================================================================

  async listSupplierPayments(companyId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.paymentRepo.findSupplierPaymentsAndCount(companyId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async getSupplierPayment(companyId: string, id: string): Promise<SupplierPaymentEntity> {
    const pmt = await this.paymentRepo.findSupplierPaymentById(companyId, id);
    if (!pmt) throw new NotFoundException('Supplier payment record not found');
    return pmt;
  }

  async createSupplierPayment(
    companyId: string,
    userId: string,
    dto: CreateSupplierPaymentDto,
  ): Promise<SupplierPaymentEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const amount = Number(dto.amount);
      if (amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than zero');
      }

      // Adjust supplier balance via SuppliersService domain contract
      await this.suppliersService.adjustBalance(companyId, dto.supplierId, -amount, queryRunner.manager);

      const reference = `SPMT-${Date.now()}`;
      const pmt = queryRunner.manager.create(SupplierPaymentEntity, {
        companyId,
        reference,
        supplierId: dto.supplierId,
        financialYearId: dto.financialYearId,
        amount,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.paymentDate || new Date(),
        status: TransactionStatus.CONFIRMED,
        confirmedBy: userId,
      });

      const saved = await this.paymentRepo.saveSupplierPayment(pmt, queryRunner.manager);

      // Transactional Outbox
      await this.outboxService.enqueue(
        companyId,
        EventTopics.PAYMENT_EVENTS,
        DomainEvents.SUPPLIER_PAYMENT_MADE,
        {
          companyId,
          paymentId: saved.id,
          supplierId: dto.supplierId,
          amount,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelSupplierPayment(
    companyId: string,
    id: string,
    dto: CancelSupplierPaymentDto,
  ): Promise<SupplierPaymentEntity> {
    const pmt = await this.getSupplierPayment(companyId, id);
    if (pmt.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Payment is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Revert supplier balance via SuppliersService domain contract
      await this.suppliersService.adjustBalance(companyId, pmt.supplierId, Number(pmt.amount), queryRunner.manager);

      pmt.status = TransactionStatus.CANCELLED;
      pmt.cancellationReason = dto.reason;
      pmt.cancelledAt = new Date();
      const saved = await this.paymentRepo.saveSupplierPayment(pmt, queryRunner.manager);

      await this.outboxService.enqueue(
        companyId,
        EventTopics.PAYMENT_EVENTS,
        DomainEvents.SUPPLIER_PAYMENT_CANCELLED,
        { companyId, paymentId: id, reason: dto.reason },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
