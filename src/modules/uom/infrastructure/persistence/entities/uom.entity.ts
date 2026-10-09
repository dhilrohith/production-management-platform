import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CompanyEntity } from '../../../../company/infrastructure/persistence/entities/company.entity';
import { UOMConversionEntity } from './uom-conversion.entity';
import { UOMStatus } from '../../../domain/enums/uom-status.enum';

@Entity({ name: 'uoms' })
@Index(['companyId', 'name'], { unique: true })
export class UOMEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  symbol: string;

  @Column({ type: 'enum', enum: UOMStatus, default: UOMStatus.ACTIVE })
  status: UOMStatus;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @OneToMany(() => UOMConversionEntity, (conv) => conv.fromUom)
  conversions: UOMConversionEntity[];
}
