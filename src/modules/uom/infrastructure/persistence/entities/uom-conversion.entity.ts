import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { UOMEntity } from './uom.entity';

@Entity({ name: 'uom_conversions' })
@Index(['companyId', 'fromUomId', 'toUomId'], { unique: true })
export class UOMConversionEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'from_uom_id', type: 'uuid' })
  fromUomId: string;

  @Column({ name: 'to_uom_id', type: 'uuid' })
  toUomId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, comment: '1 fromUom = factor toUom' })
  factor: number;

  @ManyToOne(() => UOMEntity, (uom) => uom.conversions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'from_uom_id' })
  fromUom: UOMEntity;

  @ManyToOne(() => UOMEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'to_uom_id' })
  toUom: UOMEntity;
}
