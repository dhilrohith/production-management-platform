import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CompanyEntity } from './company.entity';

@Entity({ name: 'gst_configs' })
export class GSTConfigEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 100 })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'Total GST percentage' })
  rate: number;

  @Column({ name: 'cgst_rate', type: 'decimal', precision: 5, scale: 2 })
  cgstRate: number;

  @Column({ name: 'sgst_rate', type: 'decimal', precision: 5, scale: 2 })
  sgstRate: number;

  @Column({ name: 'igst_rate', type: 'decimal', precision: 5, scale: 2 })
  igstRate: number;

  @Column({ name: 'hsn_sac', length: 20, nullable: true })
  hsnSac?: string;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;
}
