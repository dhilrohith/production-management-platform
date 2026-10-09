import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinishedProductEntity } from '../../infrastructure/persistence/entities/finished-product.entity';
import { FinishedProductVariantEntity } from '../../infrastructure/persistence/entities/finished-product-variant.entity';
import { ProductStatus } from '../../domain/enums/product-status.enum';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateFinishedProductDto,
  UpdateFinishedProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from '../../presentation/dtos/products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(FinishedProductEntity)
    private readonly productRepo: Repository<FinishedProductEntity>,
    @InjectRepository(FinishedProductVariantEntity)
    private readonly variantRepo: Repository<FinishedProductVariantEntity>,
  ) {}

  async listFinishedProducts(companyId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const [data, total] = await this.productRepo.findAndCount({
      where: { companyId },
      relations: ['baseUom', 'variants'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async createFinishedProduct(companyId: string, dto: CreateFinishedProductDto): Promise<FinishedProductEntity> {
    const product = this.productRepo.create({
      ...dto,
      companyId,
    });
    return this.productRepo.save(product);
  }

  async getFinishedProduct(companyId: string, id: string): Promise<FinishedProductEntity> {
    const product = await this.productRepo.findOne({ where: { id, companyId }, relations: ['baseUom', 'variants'] });
    if (!product) throw new NotFoundException('Finished product not found');
    return product;
  }

  async updateFinishedProduct(companyId: string, id: string, dto: UpdateFinishedProductDto): Promise<FinishedProductEntity> {
    const product = await this.getFinishedProduct(companyId, id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async deactivateFinishedProduct(companyId: string, id: string): Promise<FinishedProductEntity> {
    const product = await this.getFinishedProduct(companyId, id);
    product.status = ProductStatus.INACTIVE;
    return this.productRepo.save(product);
  }

  async createVariant(companyId: string, productId: string, dto: CreateProductVariantDto): Promise<FinishedProductVariantEntity> {
    const variant = this.variantRepo.create({
      ...dto,
      companyId,
      productId,
    });
    return this.variantRepo.save(variant);
  }

  async updateVariant(companyId: string, id: string, dto: UpdateProductVariantDto): Promise<FinishedProductVariantEntity> {
    const variant = await this.variantRepo.findOne({ where: { id, companyId } });
    if (!variant) throw new NotFoundException('Finished product variant not found');
    Object.assign(variant, dto);
    return this.variantRepo.save(variant);
  }

  async deactivateVariant(companyId: string, id: string): Promise<FinishedProductVariantEntity> {
    const variant = await this.variantRepo.findOne({ where: { id, companyId } });
    if (!variant) throw new NotFoundException('Finished product variant not found');
    variant.status = ProductStatus.INACTIVE;
    return this.variantRepo.save(variant);
  }
}
