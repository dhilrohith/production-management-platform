import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialStockEntity } from './infrastructure/persistence/entities/raw-material-stock.entity';
import { InventoryMovementEntity } from './infrastructure/persistence/entities/inventory-movement.entity';
import { StockAdjustmentEntity } from './infrastructure/persistence/entities/stock-adjustment.entity';
import { InventoryController } from './presentation/controllers/inventory.controller';
import { InventoryService } from './application/services/inventory.service';
import { INVENTORY_REPOSITORY_TOKEN } from './domain/repositories/inventory.repository.interface';
import { TypeOrmInventoryRepository } from './infrastructure/persistence/repositories/typeorm-inventory.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RawMaterialStockEntity,
      InventoryMovementEntity,
      StockAdjustmentEntity,
    ]),
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    {
      provide: INVENTORY_REPOSITORY_TOKEN,
      useClass: TypeOrmInventoryRepository,
    },
  ],
  exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule {}
