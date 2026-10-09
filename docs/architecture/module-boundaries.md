# Module Boundaries & Inter-Module Communication Map

## 1. Module Ownership Matrix

| Module | Core Responsibility | Authoritative Owner Of | Forbidden Operations |
|---|---|---|---|
| **`materials`** | Raw materials & variant metadata | Material catalogs, variant SKUs, default UOM references | Updating usable stock quantities |
| **`products`** | Finished goods & variant master-data | Finished product catalogs, variant SKUs, list pricing | Tracking production or available batch stocks |
| **`uom`** | Unit of measurement master-data & conversions | UOM codes, base UOM scaling factors | Inventory balance calculations |
| **`bom`** | Bill of Materials definitions & line recipes | Recipe structures, planned consumption ratios | Physical raw material deductions |
| **`inventory`** | **Authoritative stock owner** | `usable_quantity`, Weighted Average Cost (WAC), movement ledgers, stock adjustments | Creating sales orders, generating purchase invoices |
| **`production`** | Production lifecycle & finished batches | Production runs, material consumption ratios, `production_batches` | Directly mutating raw material stock tables |
| **`purchases`** | Supplier purchase orders & receiving | Inbound purchase lines, tax computations, bill attachments | Directly altering stock or supplier tables |
| **`sales`** | Sales orders & batch allocation | Sales invoices, line allocations, COGS computation | Directly writing to batch availability or customer tables |
| **`customers`** | Customer master-data & accounts receivable | Customer addresses, credit terms, `outstanding_balance` | Generating sales orders or issuing payments |
| **`suppliers`** | Supplier master-data & accounts payable | Supplier addresses, GST details, `outstanding_balance` | Generating purchase orders or issuing payments |
| **`payments`** | Financial settlement lifecycle | Inbound customer receipts, outbound supplier disbursements | Altering sales invoice amounts or purchase orders |
| **`expenses`** | Operational expenditure tracking | Expense categories, receipts, payment proofs | Affecting COGS or customer accounts |
| **`company`** | Tenant configuration & governance | Company profiles, financial years, GST rules | User authentication workflows |
| **`users`** | Identity, authentication, and RBAC | User credentials, roles, permissions, role assignments | Multi-tenant company configuration |
| **`auth`** | Token lifecycle & session security | Refresh tokens, JWT validation, credentials verification | Creating companies or roles directly |
| **`notifications`** | In-app alerts & retention | User notification records, read statuses, expiry purge | Business workflow enforcement |
| **`audit`** | Compliance & activity trail | Immutable audit logs, change deltas, request context | Generating business events |
| **`reports`** | Analytical queries & data exports | High-performance read SQL queries, CSV/JSON export | Writing or modifying business records |
| **`dashboard`** | Executive KPIs & profit projections | Cached aggregate read models, real-time KPI metrics | Business state mutations |
| **`search`** | Full-text indexed lookup | Multi-domain text queries across entities | Mutating searchable entity state |

---

## 2. Allowed Inter-Module Dependencies (Dependency Graph)

```
        +--------------+        +--------------+
        |  Materials   |        |   Products   |
        +-------+------+        +-------+------+
                |                       |
                v                       v
        +-------+------+        +-------+------+
        |     BOM      |        |  Production  |
        +-------+------+        +---+-------+--+
                |                   |       ^
                +-------------------+       | (batch allocation)
                                    |       |
                                    v       |
        +--------------+        +---+-------+--+        +--------------+
        |  Purchases   |------->|  Inventory   |<-------|    Sales     |
        +-------+------+        +--------------+        +-------+------+
                |                                               |
                v                                               v
        +-------+------+                                +-------+------+
        |  Suppliers   |<-------+              +------->|  Customers   |
        +--------------+        |              |        +--------------+
                                |              |
                                +-------+------+
                                        |
                                        v
                                +-------+------+
                                |   Payments   |
                                +--------------+
```

### Allowed Synchronous Application Contracts
1. **`Purchases -> Inventory`**:
   - `inventoryService.receiveStock(companyId, variantId, qty, unitCost, refId, refType, manager)`
2. **`Purchases -> Suppliers`**:
   - `suppliersService.adjustBalance(companyId, supplierId, deltaAmount, manager)`
3. **`Production -> Inventory`**:
   - `inventoryService.consumeStock(companyId, variantId, qty, refId, refType, manager)`
   - `inventoryService.revertConsumptionStock(companyId, variantId, qty, unitCost, refId, refType, manager)`
4. **`Sales -> Production`**:
   - `productionService.allocateProductBatches(companyId, variantId, qty, manager)`
   - `productionService.releaseBatchAllocation(companyId, batchId, qty, manager)`
5. **`Sales -> Customers`**:
   - `customersService.adjustBalance(companyId, customerId, deltaAmount, manager)`
6. **`Payments -> Customers`**:
   - `customersService.adjustBalance(companyId, customerId, deltaAmount, manager)`
7. **`Payments -> Suppliers`**:
   - `suppliersService.adjustBalance(companyId, supplierId, deltaAmount, manager)`

### Forbidden Dependencies
- ❌ `Sales` directly importing `TypeOrmInventoryRepository` or `ProductionBatchRepository`.
- ❌ `Purchases` directly importing `RawMaterialStockRepository` or `SupplierRepository`.
- ❌ `Production` directly modifying `raw_material_stocks` or `inventory_movements`.
- ❌ `Payments` mutating `customers` or `suppliers` directly in its queries.
- ❌ `Inventory` depending on `Purchases` or `Sales` (dependency direction is strictly downward towards Inventory).

---

## 3. Asynchronous Event-Driven Communication

Events are emitted by publishing into the `outbox_events` table during transactional state transitions, and subsequently broadcast over Kafka by the `OutboxProcessor`:

| Event Name | Kafka Topic | Producing Module | Consuming Modules | Purpose |
|---|---|---|---|---|
| `CompanyCreated` | `company.events` | `company` | `audit`, `notifications` | Setup initial company context |
| `UserCreated` | `user.events` | `users` | `audit`, `notifications` | Send welcome notification |
| `PurchaseConfirmed` | `purchase.events` | `purchases` | `audit`, `reports` | Analytics & audit record |
| `PurchaseCancelled` | `purchase.events` | `purchases` | `audit`, `notifications` | Reversal audit & alert |
| `ProductionConfirmed`| `production.events` | `production` | `audit`, `reports`, `dashboard`| Update read projections |
| `ProductionCancelled`| `production.events` | `production` | `audit`, `notifications` | Scrap / reversal tracking |
| `SaleConfirmed` | `sale.events` | `sales` | `audit`, `reports`, `dashboard`| Revenue projections & reporting |
| `SaleCancelled` | `sale.events` | `sales` | `audit`, `notifications` | Revenue reversal alert |
| `CustomerPaymentReceived` | `payment.events` | `payments` | `audit`, `notifications`| Payment acknowledgment |
| `SupplierPaymentMade` | `payment.events` | `payments` | `audit`, `reports` | Financial reconciliation |
| `StockAdjusted` | `inventory.events` | `inventory` | `audit`, `reports` | Stock ledger verification |
