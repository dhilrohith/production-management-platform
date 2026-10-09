import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { SupplierEntity } from '../../infrastructure/persistence/entities/supplier.entity';
import { SupplierStatus } from '../../domain/enums/supplier-status.enum';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateSupplierDto, UpdateSupplierDto } from '../../presentation/dtos/suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly supplierRepo: Repository<SupplierEntity>,
  ) {}

  async listSuppliers(companyId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const [data, total] = await this.supplierRepo.findAndCount({
      where: { companyId },
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async createSupplier(companyId: string, dto: CreateSupplierDto): Promise<SupplierEntity> {
    const supplier = this.supplierRepo.create({
      ...dto,
      companyId,
    });
    return this.supplierRepo.save(supplier);
  }

  async getSupplier(companyId: string, id: string): Promise<SupplierEntity> {
    const supplier = await this.supplierRepo.findOne({ where: { id, companyId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async updateSupplier(companyId: string, id: string, dto: UpdateSupplierDto): Promise<SupplierEntity> {
    const supplier = await this.getSupplier(companyId, id);
    Object.assign(supplier, dto);
    return this.supplierRepo.save(supplier);
  }

  async deactivateSupplier(companyId: string, id: string): Promise<SupplierEntity> {
    const supplier = await this.getSupplier(companyId, id);
    supplier.status = SupplierStatus.INACTIVE;
    return this.supplierRepo.save(supplier);
  }

  async getBalance(companyId: string, id: string) {
    const supplier = await this.getSupplier(companyId, id);
    return { supplierId: id, outstandingBalance: supplier.outstandingBalance };
  }

  /**
   * Application interface contract: Safe balance adjustment used by Purchases and Payments modules.
   */
  async adjustBalance(
    companyId: string,
    supplierId: string,
    deltaAmount: number,
    manager?: EntityManager,
  ): Promise<SupplierEntity> {
    const repo = manager ? manager.getRepository(SupplierEntity) : this.supplierRepo;
    const supplier = await repo.findOne({ where: { id: supplierId, companyId } });
    if (!supplier) throw new NotFoundException(`Supplier ${supplierId} not found`);

    supplier.outstandingBalance = Math.max(0, Number(supplier.outstandingBalance) + Number(deltaAmount));
    return repo.save(supplier);
  }
}
