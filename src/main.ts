import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { setupSwagger } from './config/swagger.config';
import { CorrelationIdMiddleware } from './infrastructure/observability/tracing/correlation-id.middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Correlation ID tracking
  app.use((req: any, res: any, next: any) => new CorrelationIdMiddleware().use(req, res, next));

  // Global Prefix rule
  app.setGlobalPrefix('production-management/api/v1');

  // CORS Enabled
  app.enableCors();

  // Global Exception Filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation Setup
  setupSwagger(app);

  await app.listen(port);
  logger.log(`🚀 B2B Production Management Platform running on: http://localhost:${port}/b2b-manufacturing-platform/api/v1`);
  logger.log(`📚 Swagger OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
