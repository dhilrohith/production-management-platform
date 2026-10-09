import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UOMEntity } from './infrastructure/persistence/entities/uom.entity';
import { UOMConversionEntity } from './infrastructure/persistence/entities/uom-conversion.entity';
import { UOMController } from './presentation/controllers/uom.controller';
import { UOMService } from './application/services/uom.service';

@Module({
  imports: [TypeOrmModule.forFeature([UOMEntity, UOMConversionEntity])],
  controllers: [UOMController],
  providers: [UOMService],
  exports: [UOMService, TypeOrmModule],
})
export class UOMModule {}
