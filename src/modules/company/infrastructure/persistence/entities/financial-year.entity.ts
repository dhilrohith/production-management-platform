import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CompanyEntity } from './company.entity';
import { FinancialYearStatus } from '../../../domain/enums/company-status.enum';

@Entity({ name: 'financial_years' })
@Index(['companyId', 'status'])
export class FinancialYearEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 20, comment: 'e.g. FY2024-25' })
  label: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: FinancialYearStatus, default: FinancialYearStatus.OPEN })
  status: FinancialYearStatus;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column({ name: 'closure_reason', type: 'text', nullable: true })
  closureReason?: string;

  @ManyToOne(() => CompanyEntity, (company) => company.financialYears, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;
}
