import { Module } from '@nestjs/common';
import { DashboardService } from './application/queries/dashboard.service';
import { DashboardController } from './presentation/controllers/dashboard.controller';
import { CacheInfrastructureModule } from '../../infrastructure/cache/redis/cache.module';

@Module({
  imports: [CacheInfrastructureModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
