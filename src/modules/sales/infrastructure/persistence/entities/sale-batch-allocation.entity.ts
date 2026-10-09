import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { SaleLineEntity } from './sale-line.entity';
import { ProductionBatchEntity } from '../../../../production/infrastructure/persistence/entities/production-batch.entity';

@Entity({ name: 'sale_batch_allocations' })
export class SaleBatchAllocationEntity extends AbstractBaseEntity {
  @Column({ name: 'sale_line_id', type: 'uuid' })
  saleLineId: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ name: 'batch_unit_cost', type: 'decimal', precision: 18, scale: 2, comment: 'Snapshot for COGS' })
  batchUnitCost: number;

  @Column({ name: 'allocated_cogs', type: 'decimal', precision: 18, scale: 2 })
  allocatedCOGS: number;

  @ManyToOne(() => SaleLineEntity, (line) => line.batchAllocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_line_id' })
  saleLine: SaleLineEntity;

  @ManyToOne(() => ProductionBatchEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'batch_id' })
  batch: ProductionBatchEntity;
}
