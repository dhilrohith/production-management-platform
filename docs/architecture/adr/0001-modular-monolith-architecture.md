# ADR 0001: Modular Monolith Architecture Style

## Status
Accepted

## Context
The application is a multi-tenant B2B manufacturing management platform spanning 20 functional areas (inventory, BOM, production, purchases, sales, payments, accounting, etc.). Decomposing this into microservices at this stage would introduce distributed transactions (2PC/Sagas) across critical manufacturing flows (e.g., BOM consumption + stock movement + batch allocation), network latency, complex service discovery, and increased infrastructure costs without significant organizational necessity.

## Decision
We structure the system as a **Modular Monolith** using NestJS and TypeScript:
1. All domains reside in a single codebase and deployment artifact (`src/modules/*`).
2. Domains maintain strict boundaries across Presentation, Application, Domain, and Infrastructure tiers.
3. Cross-module calls are restricted to explicit application service contracts or asynchronous events.
4. Direct cross-module repository access is forbidden.

## Consequences
### Positive
- ACID database transactions remain simple and atomic across related operations within a use-case.
- Zero network latency for inter-domain invocations.
- Greatly simplified deployment, observability, and debugging.
- Clean module boundaries allow future extraction of specific high-throughput domains (e.g., Inventory or Telemetry) into microservices if scaling requirements demand it.

### Negative
- Requires ongoing discipline and automated lint/architecture gates to prevent engineers from introducing direct imports or bypassing domain interfaces.
