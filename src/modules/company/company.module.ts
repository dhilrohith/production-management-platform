import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './infrastructure/persistence/entities/company.entity';
import { FinancialYearEntity } from './infrastructure/persistence/entities/financial-year.entity';
import { GSTConfigEntity } from './infrastructure/persistence/entities/gst-config.entity';
import { CompanyController } from './presentation/controllers/company.controller';
import { CompanyService } from './application/services/company.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyEntity,
      FinancialYearEntity,
      GSTConfigEntity,
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule {}
