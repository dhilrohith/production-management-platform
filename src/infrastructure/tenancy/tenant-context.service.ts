import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { TenantContextData } from '../../common/types/tenant.interface';

@Injectable()
export class TenantContextService {
  private static readonly storage = new AsyncLocalStorage<TenantContextData>();

  run<R>(context: TenantContextData, fn: () => R): R {
    return TenantContextService.storage.run(context, fn);
  }

  getTenantId(): string | undefined {
    return TenantContextService.storage.getStore()?.companyId;
  }

  getUserId(): string | undefined {
    return TenantContextService.storage.getStore()?.userId;
  }

  getCorrelationId(): string | undefined {
    return TenantContextService.storage.getStore()?.correlationId;
  }

  getContext(): TenantContextData | undefined {
    return TenantContextService.storage.getStore();
  }

  requireTenantId(): string {
    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant context missing: operations must execute within an active tenant scope');
    }
    return tenantId;
  }
}
