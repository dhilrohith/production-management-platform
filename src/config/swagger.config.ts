import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): OpenAPIObject {
  const options = new DocumentBuilder()
    .setTitle('Multi-Tenant B2B Manufacturing Platform API')
    .setDescription(
      'Enterprise Modular Monolith backend for manufacturing management, multi-tenancy, batch tracking, inventory, purchases, sales, and financials.',
    )
    .setVersion('2.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-Company-ID', in: 'header' }, 'X-Company-ID')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);
  return document;
}
