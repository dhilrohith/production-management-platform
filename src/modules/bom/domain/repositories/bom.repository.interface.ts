import { BOMEntity } from '../../infrastructure/persistence/entities/bom.entity';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

export interface IBomRepository {
  findAndCount(companyId: string, pagination: PaginationQueryDto): Promise<[BOMEntity[], number]>;
  findById(companyId: string, id: string): Promise<BOMEntity | null>;
  save(bom: Partial<BOMEntity>): Promise<BOMEntity>;
  deleteLines(bomId: string): Promise<void>;
}

export const BOM_REPOSITORY_TOKEN = 'IBomRepository';
