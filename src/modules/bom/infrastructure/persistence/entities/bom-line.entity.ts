import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { BOMEntity } from './bom.entity';
import { RawMaterialVariantEntity } from '../../../../materials/infrastructure/persistence/entities/raw-material-variant.entity';
import { UOMEntity } from '../../../../uom/infrastructure/persistence/entities/uom.entity';

@Entity({ name: 'bom_lines' })
export class BOMLineEntity extends AbstractBaseEntity {
  @Column({ name: 'bom_id', type: 'uuid' })
  bomId: string;

  @Column({ name: 'raw_material_variant_id', type: 'uuid' })
  rawMaterialVariantId: string;

  @Column({ name: 'expected_quantity', type: 'decimal', precision: 18, scale: 6 })
  expectedQuantity: number;

  @Column({ name: 'uom_id', type: 'uuid' })
  uomId: string;

  @ManyToOne(() => BOMEntity, (bom) => bom.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bom_id' })
  bom: BOMEntity;

  @ManyToOne(() => RawMaterialVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'raw_material_variant_id' })
  variant: RawMaterialVariantEntity;

  @ManyToOne(() => UOMEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uom_id' })
  uom: UOMEntity;
}
