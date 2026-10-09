export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'DOMAIN_RULE_VIOLATION',
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BusinessRuleViolationException extends DomainException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'BUSINESS_RULE_VIOLATION', details);
  }
}

export class InsufficientStockException extends DomainException {
  constructor(variantId: string, available: number, required: number) {
    super(
      `Insufficient stock for item variant ${variantId}. Available: ${available}, Required: ${required}`,
      'INSUFFICIENT_STOCK',
      { variantId, available, required },
    );
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with identifier '${id}' was not found`, 'ENTITY_NOT_FOUND', { entityName, id });
  }
}

export class TenantAccessViolationException extends DomainException {
  constructor(message: string = 'Multi-tenant boundary violation') {
    super(message, 'TENANT_ACCESS_VIOLATION');
  }
}
