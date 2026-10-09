import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BOMEntity } from '../entities/bom.entity';
import { BOMLineEntity } from '../entities/bom-line.entity';
import { IBomRepository } from '../../../domain/repositories/bom.repository.interface';
import { PaginationQueryDto } from '../../../../../common/dtos/pagination.dto';

@Injectable()
export class TypeOrmBomRepository implements IBomRepository {
  constructor(
    @InjectRepository(BOMEntity)
    private readonly bomRepo: Repository<BOMEntity>,
    @InjectRepository(BOMLineEntity)
    private readonly lineRepo: Repository<BOMLineEntity>,
  ) {}

  async findAndCount(companyId: string, pagination: PaginationQueryDto): Promise<[BOMEntity[], number]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    return this.bomRepo.findAndCount({
      where: { companyId },
      relations: ['variant', 'lines', 'lines.variant', 'lines.uom'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(companyId: string, id: string): Promise<BOMEntity | null> {
    return this.bomRepo.findOne({
      where: { id, companyId },
      relations: ['variant', 'lines', 'lines.variant', 'lines.uom'],
    });
  }

  async save(bom: Partial<BOMEntity>): Promise<BOMEntity> {
    return this.bomRepo.save(bom as any);
  }

  async deleteLines(bomId: string): Promise<void> {
    await this.lineRepo.delete({ bomId });
  }
}
