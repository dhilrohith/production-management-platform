import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CompanyEntity } from '../../../../company/infrastructure/persistence/entities/company.entity';
import { CustomerStatus } from '../../../domain/enums/customer-status.enum';

@Entity({ name: 'customers' })
@Index(['companyId', 'status'])
export class CustomerEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'business_name', length: 255 })
  businessName: string;

  @Column({ name: 'contact_person', length: 100, nullable: true })
  contactPerson?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 100, nullable: true })
  state?: string;

  @Column({ name: 'gst_registered', default: false })
  gstRegistered: boolean;

  @Column({ length: 20, nullable: true })
  gstin?: string;

  @Column({ name: 'outstanding_balance', type: 'decimal', precision: 18, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  status: CustomerStatus;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;
}
