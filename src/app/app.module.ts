import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Configuration
import { appConfigurations } from '../config/configuration';

// Infrastructure Entities
import { OutboxEventEntity } from '../infrastructure/messaging/outbox/outbox-event.entity';
import { AttachmentEntity } from '../infrastructure/storage/attachment.entity';

// Business Entities
import { CompanyEntity } from '../modules/company/infrastructure/persistence/entities/company.entity';
import { FinancialYearEntity } from '../modules/company/infrastructure/persistence/entities/financial-year.entity';
import { GSTConfigEntity } from '../modules/company/infrastructure/persistence/entities/gst-config.entity';
import { UserEntity } from '../modules/users/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '../modules/users/infrastructure/persistence/entities/role.entity';
import { RolePermissionEntity } from '../modules/users/infrastructure/persistence/entities/role-permission.entity';
import { RefreshTokenEntity } from '../modules/auth/infrastructure/persistence/entities/refresh-token.entity';
import { CustomerEntity } from '../modules/customers/infrastructure/persistence/entities/customer.entity';
import { SupplierEntity } from '../modules/suppliers/infrastructure/persistence/entities/supplier.entity';
import { UOMEntity } from '../modules/uom/infrastructure/persistence/entities/uom.entity';
import { UOMConversionEntity } from '../modules/uom/infrastructure/persistence/entities/uom-conversion.entity';
import { RawMaterialEntity } from '../modules/materials/infrastructure/persistence/entities/raw-material.entity';
import { RawMaterialVariantEntity } from '../modules/materials/infrastructure/persistence/entities/raw-material-variant.entity';
import { RawMaterialStockEntity } from '../modules/inventory/infrastructure/persistence/entities/raw-material-stock.entity';
import { InventoryMovementEntity } from '../modules/inventory/infrastructure/persistence/entities/inventory-movement.entity';
import { StockAdjustmentEntity } from '../modules/inventory/infrastructure/persistence/entities/stock-adjustment.entity';
import { FinishedProductEntity } from '../modules/products/infrastructure/persistence/entities/finished-product.entity';
import { FinishedProductVariantEntity } from '../modules/products/infrastructure/persistence/entities/finished-product-variant.entity';
import { BOMEntity } from '../modules/bom/infrastructure/persistence/entities/bom.entity';
import { BOMLineEntity } from '../modules/bom/infrastructure/persistence/entities/bom-line.entity';
import { PurchaseEntity } from '../modules/purchases/infrastructure/persistence/entities/purchase.entity';
import { PurchaseLineEntity } from '../modules/purchases/infrastructure/persistence/entities/purchase-line.entity';
import { ProductionEntity } from '../modules/production/infrastructure/persistence/entities/production.entity';
import { ProductionBatchEntity } from '../modules/production/infrastructure/persistence/entities/production-batch.entity';
import { ProductionConsumptionEntity } from '../modules/production/infrastructure/persistence/entities/production-consumption.entity';
import { SaleEntity } from '../modules/sales/infrastructure/persistence/entities/sale.entity';
import { SaleLineEntity } from '../modules/sales/infrastructure/persistence/entities/sale-line.entity';
import { SaleBatchAllocationEntity } from '../modules/sales/infrastructure/persistence/entities/sale-batch-allocation.entity';
import { CustomerPaymentEntity } from '../modules/payments/infrastructure/persistence/entities/customer-payment.entity';
import { SupplierPaymentEntity } from '../modules/payments/infrastructure/persistence/entities/supplier-payment.entity';
import { ExpenseCategoryEntity } from '../modules/expenses/infrastructure/persistence/entities/expense-category.entity';
import { ExpenseEntity } from '../modules/expenses/infrastructure/persistence/entities/expense.entity';
import { NotificationEntity } from '../modules/notifications/infrastructure/persistence/entities/notification.entity';
import { AuditLogEntity } from '../modules/audit/infrastructure/persistence/entities/audit-log.entity';

// Infrastructure Modules
import { TenancyModule } from '../infrastructure/tenancy/tenancy.module';
import { OutboxModule } from '../infrastructure/messaging/outbox/outbox.module';
import { KafkaInfrastructureModule } from '../infrastructure/messaging/kafka/kafka.module';
import { CacheInfrastructureModule } from '../infrastructure/cache/redis/cache.module';
import { StorageInfrastructureModule } from '../infrastructure/storage/storage.module';
import { ObservabilityModule } from '../infrastructure/observability/observability.module';

// Business Modules
import { AuthModule } from '../modules/auth/auth.module';
import { CompanyModule } from '../modules/company/company.module';
import { UsersModule } from '../modules/users/users.module';
import { CustomersModule } from '../modules/customers/customers.module';
import { SuppliersModule } from '../modules/suppliers/suppliers.module';
import { UOMModule } from '../modules/uom/uom.module';
import { MaterialsModule } from '../modules/materials/materials.module';
import { ProductsModule } from '../modules/products/products.module';
import { InventoryModule } from '../modules/inventory/inventory.module';
import { BomModule } from '../modules/bom/bom.module';
import { PurchasesModule } from '../modules/purchases/purchases.module';
import { ProductionModule } from '../modules/production/production.module';
import { SalesModule } from '../modules/sales/sales.module';
import { PaymentsModule } from '../modules/payments/payments.module';
import { ExpensesModule } from '../modules/expenses/expenses.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { ReportsModule } from '../modules/reports/reports.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { AuditModule } from '../modules/audit/audit.module';
import { SearchModule } from '../modules/search/search.module';

// App Controller & Service
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: appConfigurations,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'postgres'),
        password: configService.get<string>('database.password', 'postgres'),
        database: configService.get<string>('database.name', 'b2b_manufacturing_db'),
        entities: [
          OutboxEventEntity,
          AttachmentEntity,
          CompanyEntity,
          FinancialYearEntity,
          GSTConfigEntity,
          UserEntity,
          RoleEntity,
          RolePermissionEntity,
          RefreshTokenEntity,
          CustomerEntity,
          SupplierEntity,
          UOMEntity,
          UOMConversionEntity,
          RawMaterialEntity,
          RawMaterialVariantEntity,
          RawMaterialStockEntity,
          InventoryMovementEntity,
          StockAdjustmentEntity,
          FinishedProductEntity,
          FinishedProductVariantEntity,
          BOMEntity,
          BOMLineEntity,
          PurchaseEntity,
          PurchaseLineEntity,
          ProductionEntity,
          ProductionBatchEntity,
          ProductionConsumptionEntity,
          SaleEntity,
          SaleLineEntity,
          SaleBatchAllocationEntity,
          CustomerPaymentEntity,
          SupplierPaymentEntity,
          ExpenseCategoryEntity,
          ExpenseEntity,
          NotificationEntity,
          AuditLogEntity,
        ],
        synchronize: true, // Schema sync for development
      }),
    }),
    // Infrastructure
    TenancyModule,
    OutboxModule,
    KafkaInfrastructureModule,
    CacheInfrastructureModule,
    StorageInfrastructureModule,
    ObservabilityModule,
    // Business
    AuthModule,
    CompanyModule,
    UsersModule,
    CustomersModule,
    SuppliersModule,
    UOMModule,
    MaterialsModule,
    ProductsModule,
    InventoryModule,
    BomModule,
    PurchasesModule,
    ProductionModule,
    SalesModule,
    PaymentsModule,
    ExpensesModule,
    DashboardModule,
    ReportsModule,
    NotificationsModule,
    AuditModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
