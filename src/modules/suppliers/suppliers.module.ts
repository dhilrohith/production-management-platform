import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierEntity } from './infrastructure/persistence/entities/supplier.entity';
import { SuppliersController } from './presentation/controllers/suppliers.controller';
import { SuppliersService } from './application/services/suppliers.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierEntity])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService, TypeOrmModule],
})
export class SuppliersModule {}
