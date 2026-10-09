import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CustomerPaymentEntity } from '../entities/customer-payment.entity';
import { SupplierPaymentEntity } from '../entities/supplier-payment.entity';
import { IPaymentsRepository } from '../../../domain/repositories/payments.repository.interface';
import { PaginationQueryDto } from '../../../../../common/dtos/pagination.dto';

@Injectable()
export class TypeOrmPaymentsRepository implements IPaymentsRepository {
  constructor(
    @InjectRepository(CustomerPaymentEntity)
    private readonly custRepo: Repository<CustomerPaymentEntity>,
    @InjectRepository(SupplierPaymentEntity)
    private readonly suppRepo: Repository<SupplierPaymentEntity>,
  ) {}

  async findCustomerPaymentsAndCount(
    companyId: string,
    pagination: PaginationQueryDto,
  ): Promise<[CustomerPaymentEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    return this.custRepo.findAndCount({
      where: { companyId },
      relations: ['customer'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findCustomerPaymentById(
    companyId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<CustomerPaymentEntity | null> {
    const repo = manager ? manager.getRepository(CustomerPaymentEntity) : this.custRepo;
    return repo.findOne({ where: { id, companyId }, relations: ['customer'] });
  }

  async saveCustomerPayment(
    payment: CustomerPaymentEntity,
    manager?: EntityManager,
  ): Promise<CustomerPaymentEntity> {
    const repo = manager ? manager.getRepository(CustomerPaymentEntity) : this.custRepo;
    return repo.save(payment);
  }

  async findSupplierPaymentsAndCount(
    companyId: string,
    pagination: PaginationQueryDto,
  ): Promise<[SupplierPaymentEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    return this.suppRepo.findAndCount({
      where: { companyId },
      relations: ['supplier'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findSupplierPaymentById(
    companyId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<SupplierPaymentEntity | null> {
    const repo = manager ? manager.getRepository(SupplierPaymentEntity) : this.suppRepo;
    return repo.findOne({ where: { id, companyId }, relations: ['supplier'] });
  }

  async saveSupplierPayment(
    payment: SupplierPaymentEntity,
    manager?: EntityManager,
  ): Promise<SupplierPaymentEntity> {
    const repo = manager ? manager.getRepository(SupplierPaymentEntity) : this.suppRepo;
    return repo.save(payment);
  }
}
