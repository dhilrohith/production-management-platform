import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawMaterialEntity } from '../../infrastructure/persistence/entities/raw-material.entity';
import { RawMaterialVariantEntity } from '../../infrastructure/persistence/entities/raw-material-variant.entity';
import { MaterialStatus } from '../../domain/enums/material-status.enum';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  CreateMaterialVariantDto,
  UpdateMaterialVariantDto,
} from '../../presentation/dtos/materials.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(RawMaterialEntity)
    private readonly materialRepo: Repository<RawMaterialEntity>,
    @InjectRepository(RawMaterialVariantEntity)
    private readonly variantRepo: Repository<RawMaterialVariantEntity>,
  ) {}

  async listRawMaterials(companyId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const [data, total] = await this.materialRepo.findAndCount({
      where: { companyId },
      relations: ['baseUom', 'variants'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async createRawMaterial(companyId: string, dto: CreateRawMaterialDto): Promise<RawMaterialEntity> {
    const material = this.materialRepo.create({
      ...dto,
      companyId,
    });
    return this.materialRepo.save(material);
  }

  async getRawMaterial(companyId: string, id: string): Promise<RawMaterialEntity> {
    const material = await this.materialRepo.findOne({ where: { id, companyId }, relations: ['baseUom', 'variants'] });
    if (!material) throw new NotFoundException('Raw material not found');
    return material;
  }

  async updateRawMaterial(companyId: string, id: string, dto: UpdateRawMaterialDto): Promise<RawMaterialEntity> {
    const material = await this.getRawMaterial(companyId, id);
    Object.assign(material, dto);
    return this.materialRepo.save(material);
  }

  async deactivateRawMaterial(companyId: string, id: string): Promise<RawMaterialEntity> {
    const material = await this.getRawMaterial(companyId, id);
    material.status = MaterialStatus.INACTIVE;
    return this.materialRepo.save(material);
  }

  async createVariant(companyId: string, materialId: string, dto: CreateMaterialVariantDto): Promise<RawMaterialVariantEntity> {
    const variant = this.variantRepo.create({
      ...dto,
      companyId,
      rawMaterialId: materialId,
    });
    return this.variantRepo.save(variant);
  }

  async updateVariant(companyId: string, id: string, dto: UpdateMaterialVariantDto): Promise<RawMaterialVariantEntity> {
    const variant = await this.variantRepo.findOne({ where: { id, companyId } });
    if (!variant) throw new NotFoundException('Raw material variant not found');
    Object.assign(variant, dto);
    return this.variantRepo.save(variant);
  }

  async deactivateVariant(companyId: string, id: string): Promise<RawMaterialVariantEntity> {
    const variant = await this.variantRepo.findOne({ where: { id, companyId } });
    if (!variant) throw new NotFoundException('Raw material variant not found');
    variant.status = MaterialStatus.INACTIVE;
    return this.variantRepo.save(variant);
  }
}
