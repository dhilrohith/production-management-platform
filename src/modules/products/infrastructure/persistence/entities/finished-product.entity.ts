import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CompanyEntity } from '../../../../company/infrastructure/persistence/entities/company.entity';
import { UOMEntity } from '../../../../uom/infrastructure/persistence/entities/uom.entity';
import { FinishedProductVariantEntity } from './finished-product-variant.entity';
import { ProductStatus } from '../../../domain/enums/product-status.enum';

@Entity({ name: 'finished_products' })
@Index(['companyId', 'status'])
export class FinishedProductEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'base_uom_id', type: 'uuid' })
  baseUomId: string;

  @Column({ name: 'expiry_tracking', default: false })
  expiryTracking: boolean;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @ManyToOne(() => UOMEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'base_uom_id' })
  baseUom: UOMEntity;

  @OneToMany(() => FinishedProductVariantEntity, (variant) => variant.product, { cascade: true })
  variants: FinishedProductVariantEntity[];
}
