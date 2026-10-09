import { EntityManager } from 'typeorm';
import { CustomerPaymentEntity } from '../../infrastructure/persistence/entities/customer-payment.entity';
import { SupplierPaymentEntity } from '../../infrastructure/persistence/entities/supplier-payment.entity';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

export const PAYMENTS_REPOSITORY_TOKEN = Symbol('PAYMENTS_REPOSITORY_TOKEN');

export interface IPaymentsRepository {
  findCustomerPaymentsAndCount(
    companyId: string,
    pagination: PaginationQueryDto,
  ): Promise<[CustomerPaymentEntity[], number]>;

  findCustomerPaymentById(
    companyId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<CustomerPaymentEntity | null>;

  saveCustomerPayment(
    payment: CustomerPaymentEntity,
    manager?: EntityManager,
  ): Promise<CustomerPaymentEntity>;

  findSupplierPaymentsAndCount(
    companyId: string,
    pagination: PaginationQueryDto,
  ): Promise<[SupplierPaymentEntity[], number]>;

  findSupplierPaymentById(
    companyId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<SupplierPaymentEntity | null>;

  saveSupplierPayment(
    payment: SupplierPaymentEntity,
    manager?: EntityManager,
  ): Promise<SupplierPaymentEntity>;
}
