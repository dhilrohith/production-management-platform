import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { PurchaseEntity } from './purchase.entity';
import { RawMaterialVariantEntity } from '../../../../materials/infrastructure/persistence/entities/raw-material-variant.entity';

@Entity({ name: 'purchase_lines' })
export class PurchaseLineEntity extends AbstractBaseEntity {
  @Column({ name: 'purchase_id', type: 'uuid' })
  purchaseId: string;

  @Column({ name: 'raw_material_variant_id', type: 'uuid' })
  rawMaterialVariantId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: number;

  @Column({ name: 'base_quantity', type: 'decimal', precision: 18, scale: 6, comment: 'Normalized to base UOM' })
  baseQuantity: number;

  @Column({ name: 'uom_id', type: 'uuid' })
  uomId: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 2 })
  lineTotal: number;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @ManyToOne(() => PurchaseEntity, (p) => p.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: PurchaseEntity;

  @ManyToOne(() => RawMaterialVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'raw_material_variant_id' })
  variant: RawMaterialVariantEntity;
}
