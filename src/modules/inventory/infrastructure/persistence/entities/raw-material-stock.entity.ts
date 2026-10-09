import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { RawMaterialVariantEntity } from '../../../../materials/infrastructure/persistence/entities/raw-material-variant.entity';

@Entity({ name: 'raw_material_stocks' })
@Index(['companyId', 'variantId'], { unique: true })
export class RawMaterialStockEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'usable_quantity', type: 'decimal', precision: 18, scale: 6, default: 0 })
  usableQuantity: number;

  @Column({ name: 'weighted_average_cost', type: 'decimal', precision: 18, scale: 2, default: 0, comment: 'Recalculated on IN movements' })
  weightedAverageCost: number;

  @OneToOne(() => RawMaterialVariantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: RawMaterialVariantEntity;
}
