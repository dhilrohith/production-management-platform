import { Entity, Column, OneToMany, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { FinancialYearEntity } from './financial-year.entity';
import { CompanyStatus } from '../../../domain/enums/company-status.enum';

@Entity({ name: 'companies' })
@Index(['legalName'])
export class CompanyEntity extends AbstractBaseEntity {
  @Column({ name: 'legal_name', length: 255 })
  legalName: string;

  @Column({ name: 'display_name', length: 100 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 100 })
  state: string;

  @Column({ name: 'pin_code', length: 10, nullable: true })
  pinCode?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ name: 'gst_registered', default: false })
  gstRegistered: boolean;

  @Column({ length: 20, nullable: true })
  gstin?: string;

  @Column({ type: 'enum', enum: CompanyStatus, default: CompanyStatus.ACTIVE })
  status: CompanyStatus;

  @OneToMany(() => FinancialYearEntity, (fy) => fy.company)
  financialYears: FinancialYearEntity[];
}
