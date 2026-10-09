export const EventTopics = {
  USER_EVENTS: 'user.events',
  COMPANY_EVENTS: 'company.events',
  INVENTORY_EVENTS: 'inventory.events',
  PRODUCTION_EVENTS: 'production.events',
  PURCHASE_EVENTS: 'purchase.events',
  SALE_EVENTS: 'sale.events',
  PAYMENT_EVENTS: 'payment.events',
  EXPENSE_EVENTS: 'expense.events',
  NOTIFICATION_EVENTS: 'notification.events',
  AUDIT_EVENTS: 'audit.events',
} as const;

export const DomainEvents = {
  // Users
  USER_CREATED: 'UserCreated',
  USER_DEACTIVATED: 'UserDeactivated',
  ROLE_PERMISSIONS_ASSIGNED: 'RolePermissionsAssigned',

  // Company
  COMPANY_UPDATED: 'CompanyUpdated',
  FINANCIAL_YEAR_CLOSED: 'FinancialYearClosed',

  // Inventory
  STOCK_ADJUSTED: 'StockAdjusted',
  STOCK_ADJUSTMENT_CANCELLED: 'StockAdjustmentCancelled',
  STOCK_RESERVED: 'StockReserved',
  STOCK_RELEASED: 'StockReleased',

  // Production
  PRODUCTION_CONFIRMED: 'ProductionConfirmed',
  PRODUCTION_CANCELLED: 'ProductionCancelled',

  // Purchases
  PURCHASE_CONFIRMED: 'PurchaseConfirmed',
  PURCHASE_CANCELLED: 'PurchaseCancelled',

  // Sales
  SALE_CONFIRMED: 'SaleConfirmed',
  SALE_CANCELLED: 'SaleCancelled',

  // Payments
  CUSTOMER_PAYMENT_RECEIVED: 'CustomerPaymentReceived',
  CUSTOMER_PAYMENT_CANCELLED: 'CustomerPaymentCancelled',
  SUPPLIER_PAYMENT_MADE: 'SupplierPaymentMade',
  SUPPLIER_PAYMENT_CANCELLED: 'SupplierPaymentCancelled',

  // Expenses
  EXPENSE_CREATED: 'ExpenseCreated',
  EXPENSE_CANCELLED: 'ExpenseCancelled',
} as const;
