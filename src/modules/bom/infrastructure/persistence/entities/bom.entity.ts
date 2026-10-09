import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { FinishedProductVariantEntity } from '../../../../products/infrastructure/persistence/entities/finished-product-variant.entity';
import { BOMLineEntity } from './bom-line.entity';
import { BOMStatus } from '../../../domain/enums/bom-status.enum';

@Entity({ name: 'boms' })
@Index(['companyId', 'finishedProductVariantId', 'status'])
export class BOMEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'finished_product_variant_id', type: 'uuid' })
  finishedProductVariantId: string;

  @Column({ type: 'enum', enum: BOMStatus, default: BOMStatus.ACTIVE })
  status: BOMStatus;

  @ManyToOne(() => FinishedProductVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'finished_product_variant_id' })
  variant: FinishedProductVariantEntity;

  @OneToMany(() => BOMLineEntity, (line) => line.bom, { cascade: true })
  lines: BOMLineEntity[];
}
