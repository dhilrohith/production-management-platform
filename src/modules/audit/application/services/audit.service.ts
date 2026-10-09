import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../../infrastructure/persistence/entities/audit-log.entity';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async listAuditLogs(
    companyId: string,
    pagination: PaginationQueryDto,
    filters?: { userId?: string; action?: string; entity?: string },
  ) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const query = this.auditRepo.createQueryBuilder('audit').where('audit.companyId = :companyId', { companyId });

    if (filters?.userId) query.andWhere('audit.userId = :userId', { userId: filters.userId });
    if (filters?.action) query.andWhere('audit.action = :action', { action: filters.action });
    if (filters?.entity) query.andWhere('audit.entity = :entity', { entity: filters.entity });

    query
      .orderBy(`audit.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async record(
    companyId: string,
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    before?: object,
    after?: object,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2); // 2-year retention window

    const log = this.auditRepo.create({
      companyId,
      userId,
      action,
      entity,
      entityId,
      before,
      after,
      reason,
      ipAddress,
      userAgent,
      expiresAt,
    });
    return this.auditRepo.save(log);
  }
}
