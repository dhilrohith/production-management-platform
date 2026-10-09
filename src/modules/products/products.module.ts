import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinishedProductEntity } from './infrastructure/persistence/entities/finished-product.entity';
import { FinishedProductVariantEntity } from './infrastructure/persistence/entities/finished-product-variant.entity';
import { ProductsController } from './presentation/controllers/products.controller';
import { ProductsService } from './application/services/products.service';

@Module({
  imports: [TypeOrmModule.forFeature([FinishedProductEntity, FinishedProductVariantEntity])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
