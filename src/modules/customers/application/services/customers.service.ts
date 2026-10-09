import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CustomerEntity } from '../../infrastructure/persistence/entities/customer.entity';
import { CustomerStatus } from '../../domain/enums/customer-status.enum';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateCustomerDto, UpdateCustomerDto } from '../../presentation/dtos/customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
  ) {}

  async listCustomers(companyId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const [data, total] = await this.customerRepo.findAndCount({
      where: { companyId },
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async createCustomer(companyId: string, dto: CreateCustomerDto): Promise<CustomerEntity> {
    const customer = this.customerRepo.create({
      ...dto,
      companyId,
    });
    return this.customerRepo.save(customer);
  }

  async getCustomer(companyId: string, id: string): Promise<CustomerEntity> {
    const customer = await this.customerRepo.findOne({ where: { id, companyId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async updateCustomer(companyId: string, id: string, dto: UpdateCustomerDto): Promise<CustomerEntity> {
    const customer = await this.getCustomer(companyId, id);
    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  async deactivateCustomer(companyId: string, id: string): Promise<CustomerEntity> {
    const customer = await this.getCustomer(companyId, id);
    customer.status = CustomerStatus.INACTIVE;
    return this.customerRepo.save(customer);
  }

  async getBalance(companyId: string, id: string) {
    const customer = await this.getCustomer(companyId, id);
    return { customerId: id, outstandingBalance: customer.outstandingBalance };
  }

  /**
   * Application interface contract: Safe balance adjustment used by Sales and Payments modules.
   */
  async adjustBalance(
    companyId: string,
    customerId: string,
    deltaAmount: number,
    manager?: EntityManager,
  ): Promise<CustomerEntity> {
    const repo = manager ? manager.getRepository(CustomerEntity) : this.customerRepo;
    const customer = await repo.findOne({ where: { id: customerId, companyId } });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found`);

    customer.outstandingBalance = Math.max(0, Number(customer.outstandingBalance) + Number(deltaAmount));
    return repo.save(customer);
  }
}
