import { Entity, Column, ManyToOne, OneToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { FinishedProductVariantEntity } from '../../../../products/infrastructure/persistence/entities/finished-product-variant.entity';
import { BOMEntity } from '../../../../bom/infrastructure/persistence/entities/bom.entity';
import { ProductionBatchEntity } from './production-batch.entity';
import { ProductionConsumptionEntity } from './production-consumption.entity';
import { TransactionStatus } from '../../../../../common/enums/transaction-status.enum';

@Entity({ name: 'productions' })
@Index(['companyId', 'reference'], { unique: true })
export class ProductionEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 50 })
  reference: string;

  @Column({ name: 'finished_product_variant_id', type: 'uuid' })
  finishedProductVariantId: string;

  @Column({ name: 'bom_id', type: 'uuid' })
  bomId: string;

  @Column({ name: 'financial_year_id', type: 'uuid' })
  financialYearId: string;

  @Column({ name: 'production_date', type: 'date' })
  productionDate: Date;

  @Column({ name: 'planned_quantity', type: 'decimal', precision: 18, scale: 6 })
  plannedQuantity: number;

  @Column({ name: 'good_output', type: 'decimal', precision: 18, scale: 6 })
  goodOutput: number;

  @Column({ name: 'rejected_output', type: 'decimal', precision: 18, scale: 6, default: 0 })
  rejectedOutput: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  wastage: number;

  @Column({ name: 'variance_reason', type: 'text', nullable: true })
  varianceReason?: string;

  @Column({ name: 'total_material_cost', type: 'decimal', precision: 18, scale: 2 })
  totalMaterialCost: number;

  @Column({ name: 'unit_production_cost', type: 'decimal', precision: 18, scale: 2 })
  unitProductionCost: number;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.CONFIRMED })
  status: TransactionStatus;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'confirmed_by', type: 'uuid' })
  confirmedBy: string;

  @ManyToOne(() => FinishedProductVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'finished_product_variant_id' })
  variant: FinishedProductVariantEntity;

  @ManyToOne(() => BOMEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'bom_id' })
  bom: BOMEntity;

  @OneToOne(() => ProductionBatchEntity, (batch) => batch.production, { cascade: true })
  batch: ProductionBatchEntity;

  @OneToMany(() => ProductionConsumptionEntity, (c) => c.production, { cascade: true })
  consumptions: ProductionConsumptionEntity[];
}
