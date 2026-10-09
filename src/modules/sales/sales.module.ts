import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity } from './infrastructure/persistence/entities/sale.entity';
import { SaleLineEntity } from './infrastructure/persistence/entities/sale-line.entity';
import { SaleBatchAllocationEntity } from './infrastructure/persistence/entities/sale-batch-allocation.entity';
import { TypeOrmSalesRepository } from './infrastructure/persistence/repositories/typeorm-sales.repository';
import { SALES_REPOSITORY_TOKEN } from './domain/repositories/sales.repository.interface';
import { SalesService } from './application/services/sales.service';
import { SalesController } from './presentation/controllers/sales.controller';
import { ProductionModule } from '../production/production.module';
import { CustomersModule } from '../customers/customers.module';
import { AttachmentEntity } from '../../infrastructure/storage/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleEntity,
      SaleLineEntity,
      SaleBatchAllocationEntity,
      AttachmentEntity,
    ]),
    ProductionModule,
    CustomersModule,
  ],
  controllers: [SalesController],
  providers: [
    {
      provide: SALES_REPOSITORY_TOKEN,
      useClass: TypeOrmSalesRepository,
    },
    SalesService,
  ],
  exports: [SalesService, SALES_REPOSITORY_TOKEN],
})
export class SalesModule {}
