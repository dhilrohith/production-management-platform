export const KafkaTopics = {
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
  DEAD_LETTER_QUEUE: 'dlq.events',
} as const;
