# Multi-Tenancy Architecture & Tenant Isolation Strategy

## 1. Tenancy Model: Single Company per Tenant
The platform adopts the **Shared Database, Shared Schema with Discriminator Column (`company_id`)** pattern.

### Decision Rationale: `companyId` vs `tenantId`
Investigation of existing business entities revealed that every operational table (`raw_materials`, `production`, `sales`, `purchases`, `financial_years`, `gst_configs`) natively scopes ownership via `company_id`. In this B2B manufacturing domain, an operating manufacturing business represents an independent tenant company.

> **Decision**: `companyId` is established as the sole authoritative tenant identifier. Introducing a redundant `tenantId` alongside `companyId` was avoided because it would create dual-column foreign keys and unnecessary cognitive overhead without adding multi-organization partitioning requirements.

---

## 2. End-to-End Request Tenant Lifecycle

```
[ Inbound HTTP Request ]
       |
       v
1. CorrelationIdMiddleware
   - Resolves or generates X-Correlation-ID
       |
       v
2. JwtAuthGuard
   - Validates JWT signature, claims, expiry
   - Attaches user payload to req.user
       |
       v
3. CompanyTenantGuard
   - Inspects 'X-Company-ID' header
   - Verifies whether authenticated user belongs to the requested company
       |
       v
4. TenantInterceptor
   - Binds { companyId, userId, roles, correlationId } into TenantContextService
   - Runs downstream handler within Node.js AsyncLocalStorage scope
       |
       v
5. Application Service / Domain
   - Accesses companyId via TenantContextService.requireTenantId()
   - Executes business operations scoped to active tenant
       |
       v
6. TenantAwareRepository / TypeORM Persistence
   - Appends { companyId } filter automatically to all queries
   - Enforces company_id on persisted records
       |
       v
[ PostgreSQL (All tables indexed on company_id) ]
```

---

## 3. Asynchronous Context Propagation (`TenantContextService`)

Controller guards alone are insufficient because background jobs, asynchronous callbacks, and nested domain methods can lose request context if passed manually through method arguments.

The platform implements `TenantContextService` backed by Node.js `AsyncLocalStorage`:

```typescript
@Injectable()
export class TenantContextService {
  private static readonly storage = new AsyncLocalStorage<TenantContextData>();

  run<R>(context: TenantContextData, fn: () => R): R {
    return TenantContextService.storage.run(context, fn);
  }

  getTenantId(): string | undefined {
    return TenantContextService.storage.getStore()?.companyId;
  }

  requireTenantId(): string {
    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant context missing: operations must execute within an active tenant scope');
    }
    return tenantId;
  }
}
```

This ensures that any asynchronous operation within the call chain can deterministically access the active tenant identifier without polluting function parameter signatures.

---

## 4. Tenant-Scoped Database Constraints & Indexing

A critical vulnerability in multi-tenant shared schemas is accidental global uniqueness. For instance:

```sql
-- DANGEROUS: Company B cannot create an item with code 'RAW-001' if Company A already used it
CREATE UNIQUE INDEX idx_materials_sku ON raw_material_variants (sku);
```

All unique indexes throughout the system have been audited and scoped to tenant compound keys:

| Table | Constraint | Purpose |
|---|---|---|
| `raw_material_variants` | `UNIQUE(company_id, sku)` | Variant code unique per company |
| `finished_product_variants` | `UNIQUE(company_id, sku)` | Finished product SKU unique per company |
| `uoms` | `UNIQUE(company_id, code)` | Unit measurement symbol unique per company |
| `purchases` | `UNIQUE(company_id, reference)` | Purchase invoice number unique per company |
| `sales` | `UNIQUE(company_id, reference)` | Sales invoice number unique per company |
| `productions` | `UNIQUE(company_id, reference)` | Production order number unique per company |
| `customer_payments` | `UNIQUE(company_id, reference)` | Payment receipt unique per company |
| `supplier_payments` | `UNIQUE(company_id, reference)` | Payment voucher unique per company |
| `stock_adjustments` | `UNIQUE(company_id, reference)` | Stock audit reference unique per company |

---

## 5. Security & Authorization Rules
1. **Header Validation**: `X-Company-ID` is required for all authenticated endpoints via `@ApiHeader({ name: 'X-Company-ID', required: true })`.
2. **Access Membership Verification**: `CompanyTenantGuard` verifies that the authenticated user actually belongs to `req.headers['x-company-id']`. A valid JWT cannot be used to manipulate records of another company.
3. **Role-Based Access Control (RBAC)**: `RolesGuard` and `PermissionsGuard` verify user roles against declared metadata (`@Roles('COMPANY_ADMIN', 'PLANT_MANAGER')`).
4. **Data Isolation Tests**: Multi-tenant isolation tests in `test/unit/tenant-isolation.spec.ts` verify that concurrent asynchronous operations for distinct companies remain strictly isolated.
