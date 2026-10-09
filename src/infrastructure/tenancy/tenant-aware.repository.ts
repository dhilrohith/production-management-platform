import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions, ObjectLiteral } from 'typeorm';
import { TenantContextService } from './tenant-context.service';

export abstract class TenantAwareRepository<T extends ObjectLiteral & { companyId: string }> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly tenantContextService: TenantContextService,
  ) {}

  protected getEffectiveCompanyId(explicitCompanyId?: string): string {
    const id = explicitCompanyId || this.tenantContextService.getTenantId();
    if (!id) {
      throw new Error(
        `Multi-Tenant Safety Violation: Attempted repository operation on ${this.repository.metadata.name} without companyId in context or arguments`,
      );
    }
    return id;
  }

  async findTenant(explicitCompanyId?: string, options?: FindManyOptions<T>): Promise<T[]> {
    const companyId = this.getEffectiveCompanyId(explicitCompanyId);
    const whereClause: FindOptionsWhere<T> = {
      ...(options?.where as any),
      companyId,
    };
    return this.repository.find({ ...options, where: whereClause });
  }

  async findAndCountTenant(
    explicitCompanyId?: string,
    options?: FindManyOptions<T>,
  ): Promise<[T[], number]> {
    const companyId = this.getEffectiveCompanyId(explicitCompanyId);
    const whereClause: FindOptionsWhere<T> = {
      ...(options?.where as any),
      companyId,
    };
    return this.repository.findAndCount({ ...options, where: whereClause });
  }

  async findOneTenant(
    explicitCompanyId?: string,
    options?: FindOneOptions<T>,
  ): Promise<T | null> {
    const companyId = this.getEffectiveCompanyId(explicitCompanyId);
    const whereClause: FindOptionsWhere<T> = {
      ...(options?.where as any),
      companyId,
    };
    return this.repository.findOne({ ...options, where: whereClause });
  }

  async saveTenant(entity: Partial<T>, explicitCompanyId?: string): Promise<T> {
    const companyId = this.getEffectiveCompanyId(explicitCompanyId);
    const entityToSave = { ...entity, companyId } as any;
    return this.repository.save(entityToSave);
  }
}
