import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { SupplierEntity } from '../../../../suppliers/infrastructure/persistence/entities/supplier.entity';
import { PurchaseLineEntity } from './purchase-line.entity';
import { PaymentState, PaymentMethod } from '../../../domain/enums/purchases.enums';
import { TransactionStatus } from '../../../../../common/enums/transaction-status.enum';

@Entity({ name: 'purchases' })
@Index(['companyId', 'reference'], { unique: true })
@Index(['companyId', 'supplierId', 'purchaseDate'])
export class PurchaseEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 50 })
  reference: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @Column({ name: 'financial_year_id', type: 'uuid' })
  financialYearId: string;

  @Column({ name: 'purchase_date', type: 'date' })
  purchaseDate: Date;

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

  @ManyToOne(() => SupplierEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity;

  @OneToMany(() => PurchaseLineEntity, (line) => line.purchase, { cascade: true })
  lines: PurchaseLineEntity[];
}
