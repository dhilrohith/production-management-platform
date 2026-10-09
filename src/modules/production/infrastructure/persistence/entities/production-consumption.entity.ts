import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { ProductionEntity } from './production.entity';
import { RawMaterialVariantEntity } from '../../../../materials/infrastructure/persistence/entities/raw-material-variant.entity';

@Entity({ name: 'production_consumptions' })
export class ProductionConsumptionEntity extends AbstractBaseEntity {
  @Column({ name: 'production_id', type: 'uuid' })
  productionId: string;

  @Column({ name: 'raw_material_variant_id', type: 'uuid' })
  rawMaterialVariantId: string;

  @Column({ name: 'expected_quantity', type: 'decimal', precision: 18, scale: 6 })
  expectedQuantity: number;

  @Column({ name: 'actual_quantity', type: 'decimal', precision: 18, scale: 6 })
  actualQuantity: number;

  @Column({ name: 'base_quantity', type: 'decimal', precision: 18, scale: 6, comment: 'Normalized to base UOM' })
  baseQuantity: number;

  @Column({ name: 'uom_id', type: 'uuid' })
  uomId: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 2, comment: 'Snapshot of WAC at production time' })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 18, scale: 2 })
  totalCost: number;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @ManyToOne(() => ProductionEntity, (prod) => prod.consumptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'production_id' })
  production: ProductionEntity;

  @ManyToOne(() => RawMaterialVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'raw_material_variant_id' })
  variant: RawMaterialVariantEntity;
}
