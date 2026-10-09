import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseEntity } from './infrastructure/persistence/entities/purchase.entity';
import { PurchaseLineEntity } from './infrastructure/persistence/entities/purchase-line.entity';
import { TypeOrmPurchasesRepository } from './infrastructure/persistence/repositories/typeorm-purchases.repository';
import { PURCHASES_REPOSITORY_TOKEN } from './domain/repositories/purchases.repository.interface';
import { PurchasesService } from './application/services/purchases.service';
import { PurchasesController } from './presentation/controllers/purchases.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { AttachmentEntity } from '../../infrastructure/storage/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseEntity, PurchaseLineEntity, AttachmentEntity]),
    InventoryModule,
    SuppliersModule,
  ],
  controllers: [PurchasesController],
  providers: [
    {
      provide: PURCHASES_REPOSITORY_TOKEN,
      useClass: TypeOrmPurchasesRepository,
    },
    PurchasesService,
  ],
  exports: [PurchasesService, PURCHASES_REPOSITORY_TOKEN],
})
export class PurchasesModule {}
