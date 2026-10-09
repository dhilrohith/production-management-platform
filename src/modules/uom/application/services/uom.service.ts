import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UOMEntity } from '../../infrastructure/persistence/entities/uom.entity';
import { UOMConversionEntity } from '../../infrastructure/persistence/entities/uom-conversion.entity';
import { UOMStatus } from '../../domain/enums/uom-status.enum';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateUOMDto, UpdateUOMDto, CreateConversionDto, UpdateConversionDto } from '../../presentation/dtos/uom.dto';

@Injectable()
export class UOMService {
  constructor(
    @InjectRepository(UOMEntity)
    private readonly uomRepo: Repository<UOMEntity>,
    @InjectRepository(UOMConversionEntity)
    private readonly convRepo: Repository<UOMConversionEntity>,
  ) {}

  async listUOMs(companyId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = pagination;
    const [data, total] = await this.uomRepo.findAndCount({
      where: { companyId },
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async createUOM(companyId: string, dto: CreateUOMDto): Promise<UOMEntity> {
    const uom = this.uomRepo.create({ name: dto.name, symbol: dto.symbol, companyId });
    return this.uomRepo.save(uom);
  }

  async updateUOM(companyId: string, id: string, dto: UpdateUOMDto): Promise<UOMEntity> {
    const uom = await this.uomRepo.findOne({ where: { id, companyId } });
    if (!uom) throw new NotFoundException('UOM not found');
    Object.assign(uom, dto);
    return this.uomRepo.save(uom);
  }

  async deactivateUOM(companyId: string, id: string): Promise<UOMEntity> {
    const uom = await this.uomRepo.findOne({ where: { id, companyId } });
    if (!uom) throw new NotFoundException('UOM not found');
    uom.status = UOMStatus.INACTIVE;
    return this.uomRepo.save(uom);
  }

  async listConversions(companyId: string, uomId: string): Promise<UOMConversionEntity[]> {
    return this.convRepo.find({ where: { companyId, fromUomId: uomId }, relations: ['toUom'] });
  }

  async createConversion(companyId: string, uomId: string, dto: CreateConversionDto): Promise<UOMConversionEntity> {
    const conv = this.convRepo.create({ toUomId: dto.toUomId, factor: dto.factor, companyId, fromUomId: uomId });
    return this.convRepo.save(conv);
  }

  async updateConversion(companyId: string, id: string, dto: UpdateConversionDto): Promise<UOMConversionEntity> {
    const conv = await this.convRepo.findOne({ where: { id, companyId } });
    if (!conv) throw new NotFoundException('UOM Conversion not found');
    Object.assign(conv, dto);
    return this.convRepo.save(conv);
  }
}
