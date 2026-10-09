import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantConnectionService {
  private readonly logger = new Logger(TenantConnectionService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly tenantContextService: TenantContextService,
  ) {}

  /**
   * Returns the shared connection pool configured for tenant row-level / column isolation.
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Sets PostgreSQL session settings (e.g. app.current_tenant_id) on a query runner if using RLS.
   */
  async setTenantSession(companyId?: string): Promise<void> {
    const id = companyId || this.tenantContextService.getTenantId();
    if (id) {
      await this.dataSource.query(`SET LOCAL app.current_company_id = '${id}'`);
    }
  }
}
