import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { SaleEntity } from '../entities/sale.entity';
import { ISalesRepository } from '../../../domain/repositories/sales.repository.interface';
import { PaginationQueryDto } from '../../../../../common/dtos/pagination.dto';

@Injectable()
export class TypeOrmSalesRepository implements ISalesRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly repo: Repository<SaleEntity>,
  ) {}

  async findSalesAndCount(
    companyId: string,
    pagination: PaginationQueryDto,
  ): Promise<[SaleEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    return this.repo.findAndCount({
      where: { companyId },
      relations: [
        'customer',
        'lines',
        'lines.variant',
        'lines.batchAllocations',
        'lines.batchAllocations.batch',
      ],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findSaleById(
    companyId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<SaleEntity | null> {
    const repo = manager ? manager.getRepository(SaleEntity) : this.repo;
    return repo.findOne({
      where: { id, companyId },
      relations: [
        'customer',
        'lines',
        'lines.variant',
        'lines.batchAllocations',
        'lines.batchAllocations.batch',
      ],
    });
  }

  async saveSale(
    sale: SaleEntity,
    manager?: EntityManager,
  ): Promise<SaleEntity> {
    const repo = manager ? manager.getRepository(SaleEntity) : this.repo;
    return repo.save(sale);
  }
}
