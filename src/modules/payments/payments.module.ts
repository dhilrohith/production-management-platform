import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPaymentEntity } from './infrastructure/persistence/entities/customer-payment.entity';
import { SupplierPaymentEntity } from './infrastructure/persistence/entities/supplier-payment.entity';
import { TypeOrmPaymentsRepository } from './infrastructure/persistence/repositories/typeorm-payments.repository';
import { PAYMENTS_REPOSITORY_TOKEN } from './domain/repositories/payments.repository.interface';
import { PaymentsService } from './application/services/payments.service';
import { CustomerPaymentsController, SupplierPaymentsController } from './presentation/controllers/payments.controller';
import { CustomersModule } from '../customers/customers.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerPaymentEntity, SupplierPaymentEntity]),
    CustomersModule,
    SuppliersModule,
  ],
  controllers: [CustomerPaymentsController, SupplierPaymentsController],
  providers: [
    {
      provide: PAYMENTS_REPOSITORY_TOKEN,
      useClass: TypeOrmPaymentsRepository,
    },
    PaymentsService,
  ],
  exports: [PaymentsService, PAYMENTS_REPOSITORY_TOKEN],
})
export class PaymentsModule {}
