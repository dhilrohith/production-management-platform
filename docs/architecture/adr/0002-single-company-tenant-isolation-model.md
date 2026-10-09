# ADR 0002: Single-Company Tenant Isolation Model

## Status
Accepted

## Context
In multi-tenant SaaS platforms, tenant modeling often oscillates between `tenantId` (representing a client organization) and `companyId` (representing an operating legal business unit). In this manufacturing ERP platform, all database entities originally incorporated `company_id` as the primary scoping foreign key.

## Decision
We standardized on `companyId` as the sole tenant identifier throughout the platform:
1. One tenant organization corresponds directly to one manufacturing company.
2. We explicitly avoided introducing a secondary `tenantId` column alongside `companyId` to prevent redundant indexing, dual foreign keys, and confusion.
3. Tenant isolation is enforced across three layers:
   - **Authentication/Guard Layer**: `CompanyTenantGuard` verifies that the authenticated user belongs to `X-Company-ID`.
   - **Context Layer**: `TenantContextService` provides AsyncLocalStorage propagation.
   - **Database Layer**: Compound unique constraints `UNIQUE(company_id, ...)` prevent multi-tenant collisions.

## Consequences
### Positive
- High data integrity and clean relational integrity in PostgreSQL.
- Eliminates redundant columns and avoids database schema migration complexity.

### Negative
- If a future requirement demands a single tenant managing multiple holding companies/subsidiaries under one shared account, an organization-to-company parent hierarchy must be introduced.
