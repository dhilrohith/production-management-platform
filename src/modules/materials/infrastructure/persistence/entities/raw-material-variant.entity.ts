import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { RawMaterialEntity } from './raw-material.entity';
import { MaterialStatus } from '../../../domain/enums/material-status.enum';

@Entity({ name: 'raw_material_variants' })
@Index(['companyId', 'sku'], { unique: true })
export class RawMaterialVariantEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'raw_material_id', type: 'uuid' })
  rawMaterialId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: MaterialStatus, default: MaterialStatus.ACTIVE })
  status: MaterialStatus;

  @ManyToOne(() => RawMaterialEntity, (rm) => rm.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raw_material_id' })
  rawMaterial: RawMaterialEntity;
}
