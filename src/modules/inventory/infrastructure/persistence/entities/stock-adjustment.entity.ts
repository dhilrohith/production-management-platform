import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { RawMaterialVariantEntity } from '../../../../materials/infrastructure/persistence/entities/raw-material-variant.entity';
import { AdjustmentType } from '../../../domain/enums/inventory.enums';
import { TransactionStatus } from '../../../../../common/enums/transaction-status.enum';

@Entity({ name: 'stock_adjustments' })
@Index(['companyId', 'reference'], { unique: true })
export class StockAdjustmentEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 50 })
  reference: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ type: 'enum', enum: AdjustmentType })
  type: AdjustmentType;

  @Column({ name: 'quantity_before', type: 'decimal', precision: 18, scale: 6 })
  quantityBefore: number;

  @Column({ name: 'adjustment_quantity', type: 'decimal', precision: 18, scale: 6 })
  adjustmentQuantity: number;

  @Column({ name: 'quantity_after', type: 'decimal', precision: 18, scale: 6 })
  quantityAfter: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'adjusted_by', type: 'uuid' })
  adjustedBy: string;

  @Column({ name: 'financial_year_id', type: 'uuid' })
  financialYearId: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.CONFIRMED })
  status: TransactionStatus;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy?: string;

  @ManyToOne(() => RawMaterialVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'variant_id' })
  variant: RawMaterialVariantEntity;
}
