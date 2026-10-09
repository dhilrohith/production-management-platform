# ADR 0005: Authoritative Inventory Ownership

## Status
Accepted

## Context
In previous iterations, the `purchases` module directly created `raw_material_stocks` and `inventory_movements`, while the `production` module directly subtracted stock from `raw_material_stocks`. This resulted in duplicated Weighted Average Cost (WAC) calculations, inconsistent stock ledger movements, and multi-module concurrency conflicts over the stock tables.

## Decision
We established **`inventory` as the sole, authoritative owner of physical stock**:
1. All stock additions, deductions, valuations, and ledger movements must be executed via `InventoryService`:
   - `inventoryService.receiveStock(...)` handles inbound goods and recalculates Weighted Average Cost (WAC).
   - `inventoryService.consumeStock(...)` verifies stock availability, decrements usable stock, and logs consumption movements.
   - `inventoryService.revertConsumptionStock(...)` handles rollbacks for cancelled production batches.
2. `Purchases` and `Production` modules are strictly prohibited from directly querying or saving `raw_material_stocks` or `inventory_movements`.
3. Similarly, `production` is established as the sole authoritative owner of finished product batches (`production_batches`), exposing `allocateProductBatches` for `Sales`.

## Consequences
### Positive
- A single source of truth for raw material stock quantities and valuation formulas.
- Guaranteed generation of consistent audit movements for every stock change.
- Strict concurrency control and atomic validation of stock constraints.

### Negative
- Inter-module calls require passing an optional TypeORM `EntityManager` when participating within a parent use-case database transaction.
