import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionEntity } from './infrastructure/persistence/entities/production.entity';
import { ProductionBatchEntity } from './infrastructure/persistence/entities/production-batch.entity';
import { ProductionConsumptionEntity } from './infrastructure/persistence/entities/production-consumption.entity';
import { TypeOrmProductionRepository } from './infrastructure/persistence/repositories/typeorm-production.repository';
import { PRODUCTION_REPOSITORY_TOKEN } from './domain/repositories/production.repository.interface';
import { ProductionService } from './application/services/production.service';
import { ProductionController } from './presentation/controllers/production.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductionEntity, ProductionBatchEntity, ProductionConsumptionEntity]),
    InventoryModule,
  ],
  controllers: [ProductionController],
  providers: [
    {
      provide: PRODUCTION_REPOSITORY_TOKEN,
      useClass: TypeOrmProductionRepository,
    },
    ProductionService,
  ],
  exports: [ProductionService, PRODUCTION_REPOSITORY_TOKEN],
})
export class ProductionModule {}
