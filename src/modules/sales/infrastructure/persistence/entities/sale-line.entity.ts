import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { SaleEntity } from './sale.entity';
import { FinishedProductVariantEntity } from '../../../../products/infrastructure/persistence/entities/finished-product-variant.entity';
import { SaleBatchAllocationEntity } from './sale-batch-allocation.entity';

@Entity({ name: 'sale_lines' })
export class SaleLineEntity extends AbstractBaseEntity {
  @Column({ name: 'sale_id', type: 'uuid' })
  saleId: string;

  @Column({ name: 'finished_product_variant_id', type: 'uuid' })
  finishedProductVariantId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ name: 'base_quantity', type: 'decimal', precision: 18, scale: 6 })
  baseQuantity: number;

  @Column({ name: 'uom_id', type: 'uuid' })
  uomId: string;

  @Column({ name: 'selling_price', type: 'decimal', precision: 18, scale: 2 })
  sellingPrice: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 2 })
  lineTotal: number;

  @ManyToOne(() => SaleEntity, (sale) => sale.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: SaleEntity;

  @ManyToOne(() => FinishedProductVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'finished_product_variant_id' })
  variant: FinishedProductVariantEntity;

  @OneToMany(() => SaleBatchAllocationEntity, (alloc) => alloc.saleLine, { cascade: true })
  batchAllocations: SaleBatchAllocationEntity[];
}
