export enum TransactionStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  UPI = 'UPI',
  CREDIT = 'CREDIT',
}

export enum PaymentState {
  CREDIT = 'CREDIT',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
}
