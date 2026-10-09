import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { ExpenseCategoryEntity } from './expense-category.entity';
import { PaymentMethod, TransactionStatus } from '../../../../../common/enums/transaction-status.enum';

@Entity({ name: 'expenses' })
@Index(['companyId', 'date', 'status'])
export class ExpenseEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'financial_year_id', type: 'uuid' })
  financialYearId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.CONFIRMED })
  status: TransactionStatus;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => ExpenseCategoryEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: ExpenseCategoryEntity;
}
