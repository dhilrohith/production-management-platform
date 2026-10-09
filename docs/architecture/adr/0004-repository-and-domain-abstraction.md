# ADR 0004: Repository and Domain Persistence Abstraction

## Status
Accepted

## Context
In standard NestJS applications, services frequently inject TypeORM's `@InjectRepository(Entity)` directly into business services. This couples core business logic tightly to TypeORM, making unit testing reliant on complex database mocks and preventing clean persistence evolution.

## Decision
For Tier 1 high-complexity core domains (`bom`, `inventory`, `production`, `purchases`, `sales`, `payments`):
1. Domain/Application layers define repository interfaces:
   - Example: `IInventoryRepository`, `IProductionRepository`, `ISalesRepository`.
2. Infrastructure layers implement these contracts using TypeORM:
   - Example: `TypeOrmInventoryRepository`, `TypeOrmProductionRepository`.
3. Application services depend solely on the domain interface token:
   - `@Inject(INVENTORY_REPOSITORY_TOKEN) private readonly inventoryRepo: IInventoryRepository`.
4. Domain entities and enums are completely free of TypeORM, Kafka, Redis, or cloud SDK dependencies.

## Consequences
### Positive
- Domain and application services can be tested with lightweight in-memory stubs without spinning up database connections or mocking TypeORM query builders.
- Clean architectural boundaries aligned with Hexagonal / Clean Architecture.

### Negative
- Requires maintaining explicit repository interface contracts and provider token bindings.
