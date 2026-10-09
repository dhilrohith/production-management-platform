import { Module, Global } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';
import { TenantInterceptor } from './tenant.interceptor';
import { TenantConnectionService } from './tenant-connection.service';

@Global()
@Module({
  providers: [
    TenantContextService,
    TenantInterceptor,
    TenantConnectionService,
  ],
  exports: [
    TenantContextService,
    TenantInterceptor,
    TenantConnectionService,
  ],
})
export class TenancyModule {}
