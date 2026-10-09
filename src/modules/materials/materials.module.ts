import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialEntity } from './infrastructure/persistence/entities/raw-material.entity';
import { RawMaterialVariantEntity } from './infrastructure/persistence/entities/raw-material-variant.entity';
import { MaterialsController } from './presentation/controllers/materials.controller';
import { MaterialsService } from './application/services/materials.service';

@Module({
  imports: [TypeOrmModule.forFeature([RawMaterialEntity, RawMaterialVariantEntity])],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService, TypeOrmModule],
})
export class MaterialsModule {}
