import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CustomerEntity } from '../../../../customers/infrastructure/persistence/entities/customer.entity';
import { SaleLineEntity } from './sale-line.entity';
import { PaymentState, PaymentMethod } from '../../../domain/enums/sales.enums';
import { TransactionStatus } from '../../../../../common/enums/transaction-status.enum';

@Entity({ name: 'sales' })
@Index(['companyId', 'reference'], { unique: true })
@Index(['companyId', 'customerId', 'saleDate'])
export class SaleEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 50 })
  reference: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'financial_year_id', type: 'uuid' })
  financialYearId: string;

  @Column({ name: 'sale_date', type: 'date' })
  saleDate: Date;

  @Column({ name: 'gst_config_id', type: 'uuid' })
  gstConfigId: string;

  @Column({ name: 'taxable_amount', type: 'decimal', precision: 18, scale: 2 })
  taxableAmount: number;

  @Column({ name: 'cgst_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  cgstAmount: number;

  @Column({ name: 'sgst_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  sgstAmount: number;

  @Column({ name: 'igst_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  igstAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ name: 'estimated_cogs', type: 'decimal', precision: 18, scale: 2, comment: 'Sum of batch quantities * batch unit costs' })
  estimatedCOGS: number;

  @Column({ name: 'payment_state', type: 'enum', enum: PaymentState })
  paymentState: PaymentState;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 18, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod?: PaymentMethod;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate?: Date;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.CONFIRMED })
  status: TransactionStatus;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'confirmed_by', type: 'uuid' })
  confirmedBy: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @OneToMany(() => SaleLineEntity, (line) => line.sale, { cascade: true })
  lines: SaleLineEntity[];
}
