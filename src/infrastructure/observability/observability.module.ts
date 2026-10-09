import { Module, Global } from '@nestjs/common';
import { StructuredLoggerService } from './logger/structured-logger.service';
import { HealthController } from './health/health.controller';

@Global()
@Module({
  controllers: [HealthController],
  providers: [StructuredLoggerService],
  exports: [StructuredLoggerService],
})
export class ObservabilityModule {}
