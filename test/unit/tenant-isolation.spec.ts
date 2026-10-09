import { TenantContextService } from '../../src/infrastructure/tenancy/tenant-context.service';

describe('TenantContextService (AsyncLocalStorage Isolation)', () => {
  let tenantContextService: TenantContextService;

  beforeEach(() => {
    tenantContextService = new TenantContextService();
  });

  it('should return undefined when no tenant context is active', () => {
    expect(tenantContextService.getTenantId()).toBeUndefined();
    expect(tenantContextService.getContext()).toBeUndefined();
  });

  it('should throw error when requireTenantId is called without active context', () => {
    expect(() => tenantContextService.requireTenantId()).toThrow('Tenant context missing');
  });

  it('should accurately store and retrieve companyId within run', () => {
    const testCompanyId = '8f4c2813-11b0-4f5a-9428-2b810850dfd1';
    const testUserId = '3e804f99-4c16-4d04-bfec-981f26a117b9';

    tenantContextService.run(
      {
        companyId: testCompanyId,
        userId: testUserId,
        roles: ['COMPANY_ADMIN'],
        correlationId: 'req-12345',
      },
      () => {
        expect(tenantContextService.getTenantId()).toBe(testCompanyId);
        expect(tenantContextService.requireTenantId()).toBe(testCompanyId);
        expect(tenantContextService.getUserId()).toBe(testUserId);
        expect(tenantContextService.getContext()?.roles).toContain('COMPANY_ADMIN');
      },
    );
  });

  it('should isolate concurrent asynchronous operations between distinct tenants', async () => {
    const tenantA = 'tenant-a-uuid-1111';
    const tenantB = 'tenant-b-uuid-2222';

    const p1 = new Promise<void>((resolve) => {
      tenantContextService.run({ companyId: tenantA, correlationId: 'c1' }, async () => {
        await new Promise((r) => setTimeout(r, 50));
        expect(tenantContextService.getTenantId()).toBe(tenantA);
        resolve();
      });
    });

    const p2 = new Promise<void>((resolve) => {
      tenantContextService.run({ companyId: tenantB, correlationId: 'c2' }, async () => {
        await new Promise((r) => setTimeout(r, 20));
        expect(tenantContextService.getTenantId()).toBe(tenantB);
        resolve();
      });
    });

    await Promise.all([p1, p2]);
  });
});
