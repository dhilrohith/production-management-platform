import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CompanyEntity } from '../../../../company/infrastructure/persistence/entities/company.entity';
import { CategoryStatus } from '../../../domain/enums/category-status.enum';

@Entity({ name: 'expense_categories' })
@Index(['companyId', 'name'], { unique: true })
export class ExpenseCategoryEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  status: CategoryStatus;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;
}
