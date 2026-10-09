import { Entity, Column, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';

@Entity({ name: 'audit_logs' })
@Index(['companyId', 'entity', 'createdAt'])
@Index(['companyId', 'userId', 'createdAt'])
export class AuditLogEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100 })
  entity: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  before?: object;

  @Column({ type: 'jsonb', nullable: true })
  after?: object;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'expires_at', type: 'timestamp', comment: '2 year retention rule' })
  expiresAt: Date;
}
