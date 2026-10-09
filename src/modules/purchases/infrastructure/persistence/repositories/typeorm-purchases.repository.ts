import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PurchaseEntity } from '../entities/purchase.entity';
import { IPurchasesRepository } from '../../../domain/repositories/purchases.repository.interface';
import { PaginationQueryDto } from '../../../../../common/dtos/pagination.dto';

@Injectable()
export class TypeOrmPurchasesRepository implements IPurchasesRepository {
  constructor(
    @InjectRepository(PurchaseEntity)
    private readonly repo: Repository<PurchaseEntity>,
  ) {}

  async findPurchasesAndCount(
    companyId: string,
    pagination: PaginationQueryDto,
  ): Promise<[PurchaseEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    return this.repo.findAndCount({
      where: { companyId },
      relations: ['supplier', 'lines', 'lines.variant'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findPurchaseById(
    companyId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<PurchaseEntity | null> {
    const repo = manager ? manager.getRepository(PurchaseEntity) : this.repo;
    return repo.findOne({
      where: { id, companyId },
      relations: ['supplier', 'lines', 'lines.variant'],
    });
  }

  async savePurchase(
    purchase: PurchaseEntity,
    manager?: EntityManager,
  ): Promise<PurchaseEntity> {
    const repo = manager ? manager.getRepository(PurchaseEntity) : this.repo;
    return repo.save(purchase);
  }
}
