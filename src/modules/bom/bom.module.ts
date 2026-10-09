import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BOMEntity } from './infrastructure/persistence/entities/bom.entity';
import { BOMLineEntity } from './infrastructure/persistence/entities/bom-line.entity';
import { BomController } from './presentation/controllers/bom.controller';
import { BomService } from './application/services/bom.service';
import { BOM_REPOSITORY_TOKEN } from './domain/repositories/bom.repository.interface';
import { TypeOrmBomRepository } from './infrastructure/persistence/repositories/typeorm-bom.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BOMEntity, BOMLineEntity])],
  controllers: [BomController],
  providers: [
    BomService,
    {
      provide: BOM_REPOSITORY_TOKEN,
      useClass: TypeOrmBomRepository,
    },
  ],
  exports: [BomService, TypeOrmModule],
})
export class BomModule {}
