import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { BOMEntity } from '../../infrastructure/persistence/entities/bom.entity';
import { BOMLineEntity } from '../../infrastructure/persistence/entities/bom-line.entity';
import { BOMStatus } from '../../domain/enums/bom-status.enum';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateBOMDto, UpdateBOMDto } from '../../presentation/dtos/bom.dto';
import { IBomRepository, BOM_REPOSITORY_TOKEN } from '../../domain/repositories/bom.repository.interface';

@Injectable()
export class BomService {
  constructor(
    @Inject(BOM_REPOSITORY_TOKEN)
    private readonly bomRepo: IBomRepository,
  ) {}

  async listBOMs(companyId: string, pagination: PaginationQueryDto) {
    const [data, total] = await this.bomRepo.findAndCount(companyId, pagination);
    return { data, total, page: pagination.page || 1, limit: pagination.limit || 20 };
  }

  async createBOM(companyId: string, dto: CreateBOMDto): Promise<BOMEntity> {
    const bom = {
      companyId,
      finishedProductVariantId: dto.finishedProductVariantId,
      lines: dto.lines as any,
    };
    return this.bomRepo.save(bom);
  }

  async getBOM(companyId: string, id: string): Promise<BOMEntity> {
    const bom = await this.bomRepo.findById(companyId, id);
    if (!bom) throw new NotFoundException('BOM not found');
    return bom;
  }

  async updateBOM(companyId: string, id: string, dto: UpdateBOMDto): Promise<BOMEntity> {
    const bom = await this.getBOM(companyId, id);
    if (dto.lines) {
      await this.bomRepo.deleteLines(id);
      bom.lines = dto.lines.map((l) => ({ ...l, bomId: id })) as any;
    }
    return this.bomRepo.save(bom);
  }

  async deactivateBOM(companyId: string, id: string): Promise<BOMEntity> {
    const bom = await this.getBOM(companyId, id);
    bom.status = BOMStatus.INACTIVE;
    return this.bomRepo.save(bom);
  }
}
