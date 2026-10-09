import { Entity, Column, OneToOne, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { ProductionEntity } from './production.entity';
import { FinishedProductVariantEntity } from '../../../../products/infrastructure/persistence/entities/finished-product-variant.entity';
import { BatchStatus } from '../../../domain/enums/production.enums';

@Entity({ name: 'production_batches' })
@Index(['companyId', 'batchNumber'], { unique: true })
export class ProductionBatchEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'production_id', type: 'uuid' })
  productionId: string;

  @Column({ name: 'batch_number', length: 50 })
  batchNumber: string;

  @Column({ name: 'finished_product_variant_id', type: 'uuid' })
  finishedProductVariantId: string;

  @Column({ name: 'good_output', type: 'decimal', precision: 18, scale: 6 })
  goodOutput: number;

  @Column({ name: 'available_quantity', type: 'decimal', precision: 18, scale: 6 })
  availableQuantity: number;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'batch_unit_cost', type: 'decimal', precision: 18, scale: 2 })
  batchUnitCost: number;

  @Column({ name: 'total_material_cost', type: 'decimal', precision: 18, scale: 2 })
  totalMaterialCost: number;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.AVAILABLE })
  status: BatchStatus;

  @OneToOne(() => ProductionEntity, (prod) => prod.batch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'production_id' })
  production: ProductionEntity;

  @ManyToOne(() => FinishedProductVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'finished_product_variant_id' })
  variant: FinishedProductVariantEntity;
}
