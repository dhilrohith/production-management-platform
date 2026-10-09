import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { FinishedProductEntity } from './finished-product.entity';
import { ProductStatus } from '../../../domain/enums/product-status.enum';

@Entity({ name: 'finished_product_variants' })
@Index(['companyId', 'sku'], { unique: true })
export class FinishedProductVariantEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  sku: string;

  @Column({ name: 'selling_price', type: 'decimal', precision: 18, scale: 2, nullable: true })
  sellingPrice?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @ManyToOne(() => FinishedProductEntity, (prod) => prod.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: FinishedProductEntity;
}
