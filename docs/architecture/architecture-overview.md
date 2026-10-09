# Architecture Overview: Enterprise B2B Manufacturing Platform Modular Monolith

## 1. Executive Summary & Architecture Style
This platform is structured as a **Production-Grade Modular Monolith** in NestJS and TypeScript backed by PostgreSQL and TypeORM. Rather than decomposing into premature microservices with distributed transaction penalties, network latency, and infrastructure sprawl, the system preserves high operational cohesion while enforcing strict hexagonal/clean architectural boundaries across 20 distinct business and supporting modules.

```
                           +-------------------------------------+
                           |            Presentation             |
                           |  (Thin Controllers, Validated DTOs) |
                           +------------------+------------------+
                                              |
                                              v
                           +-------------------------------------+
                           |             Application             |
                           |   (Use Cases, Contracts, Workflows) |
                           +------------------+------------------+
                                              |
                                              v
                           +-------------------------------------+
                           |               Domain                |
                           |  (Entities, Enums, Repositories)    |
                           +------------------+------------------+
                                              ^
                                              | implements
                           +------------------+------------------+
                           |           Infrastructure            |
                           |  (TypeORM, Tenancy, Outbox, Redis)  |
                           +-------------------------------------+
```

---

## 2. Structural Tiers & Domain Categorization

Modules are divided into three architectural tiers to prevent boilerplate overhead while safeguarding core business consistency:

### Tier 1: High-Complexity Core Domains
- **Modules**: `bom`, `inventory`, `production`, `purchases`, `sales`, `payments`
- **Pattern**: Strict Domain/Application/Infrastructure/Presentation separation.
  - `domain/repositories/`: Interfaces defining persistence capabilities (`IInventoryRepository`, `IProductionRepository`, etc.).
  - `infrastructure/persistence/`: TypeORM implementations conforming to domain interfaces.
  - `application/services/`: Enforces cross-module application contracts and transaction boundaries.

### Tier 2: Standard Business Master-Data Domains
- **Modules**: `company`, `users`, `materials`, `products`, `uom`, `suppliers`, `customers`, `expenses`
- **Pattern**: Simplified clean architecture with domain entity separation, typed request DTOs with `class-validator`, and scoped services.

### Tier 3: Supporting Infrastructure & Read-Model Modules
- **Modules**: `auth`, `notifications`, `audit`, `reports`, `dashboard`, `search`
- **Pattern**: Optimized for query throughput. `dashboard` and `reports` bypass entity hydration using indexed read-model SQL and Redis caching.

---

## 3. Dependency Rules & Boundaries

1. **Inward Dependencies Only**:
   - Presentation depends on Application.
   - Application depends on Domain interfaces.
   - Infrastructure depends on Domain and Application interfaces.
   - **Domain NEVER depends on Infrastructure, TypeORM, Kafka, Redis, or AWS SDKs.**
2. **No Cross-Module Repository Access**:
   - Modules are strictly forbidden from injecting repositories belonging to other modules.
   - Purchases and Production interact with raw material stock strictly via `InventoryService.receiveStock(...)` and `InventoryService.consumeStock(...)`.
   - Sales interacts with finished goods inventory strictly via `ProductionService.allocateProductBatches(...)`.
   - Sales, Purchases, and Payments interact with customer and supplier balances strictly via `CustomersService.adjustBalance(...)` and `SuppliersService.adjustBalance(...)`.
3. **Common Folder Rules**:
   - `src/common` contains zero business logic, zero domain calculations, and zero entity declarations.
   - Restricted to global guards, decorators, filters, interceptors, domain exceptions, and base types.

---

## 4. Multi-Tenancy Architecture

- **Tenant Identifier**: `companyId` (single company per tenant model). Every business table includes indexed `company_id`.
- **Tenant Context Propagation**: Transparent Node.js `AsyncLocalStorage` via `TenantContextService`.
- **Lifecycle**:
  ```
  HTTP Request 
    -> CorrelationIdMiddleware (attaches X-Correlation-ID)
    -> JwtAuthGuard (validates Bearer token)
    -> CompanyTenantGuard (verifies user membership in X-Company-ID)
    -> TenantInterceptor (activates AsyncLocalStorage context)
    -> Application Service
    -> Tenant-Scoped Repository
    -> PostgreSQL
  ```
- **Tenant-Scoped Constraints**: All unique indexes are compound: `UNIQUE(company_id, reference)` or `UNIQUE(company_id, code)` to prevent multi-tenant collision.

---

## 5. Transaction & Messaging Architecture

### Transaction Boundaries
Transactions are strictly controlled at use-case boundaries using TypeORM `QueryRunner` or `TransactionRunner`. Long-running operations or external network calls are never executed inside database transactions.

### Transactional Outbox Pattern
Direct, uncoordinated Kafka publishing inside database transactions is strictly prohibited. When an aggregate is updated:
1. Business entities are written within the active transaction.
2. An `OutboxEventEntity` record is inserted into `outbox_events` within the *same* database transaction.
3. The database transaction commits atomically.
4. `OutboxProcessor` (background cron/worker) polls pending events, dispatches them to Kafka, and marks them `PUBLISHED`.
5. If Kafka publishing fails up to 4 retry attempts, the event is marked `FAILED` and routed to the Dead Letter Queue (`dlq.handler.ts`).

```
[ HTTP Request ]
       |
       v
[ Begin DB Transaction ]
       |
       +---> [ Update Business Tables ] (e.g., inventory_movements, sales)
       |
       +---> [ Insert Outbox Event ]    (table: outbox_events)
       |
[ Commit DB Transaction ]
       |
       v
[ Response Returned to Client (201 Created) ]

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

[ OutboxProcessor (Background Poller) ]
       |
       +---> [ Poll Outbox Events (status = PENDING) ]
       |
       +---> [ Emit Event to Apache Kafka Broker ]
       |
       +---> [ Mark Outbox Event = PUBLISHED ]
       |
       +---> (On Max Retries) -> [ Route to DLQ & Mark FAILED ]
```

---

## 6. Observability & System Reliability
- **Structured Logging**: Structured JSON logger (`StructuredLoggerService`) tagging every log entry with `timestamp`, `level`, `context`, `correlationId`, `companyId`, and `userId`.
- **Correlation Tracking**: `CorrelationIdMiddleware` assigns or propagates `X-Correlation-ID` across HTTP headers, logs, and Kafka outbox envelopes.
- **Health Checks**: `/health` endpoint reporting database and Kafka infrastructure availability.
- **Error Normalization**: `AllExceptionsFilter` and `HttpExceptionFilter` intercept unhandled errors, ensuring database schemas and internal stack traces are sanitized before responding to API consumers.
