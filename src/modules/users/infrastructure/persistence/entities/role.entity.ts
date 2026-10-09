import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CompanyEntity } from '../../../../company/infrastructure/persistence/entities/company.entity';
import { RolePermissionEntity } from './role-permission.entity';
import { RoleStatus } from '../../../domain/enums/user-status.enum';

@Entity({ name: 'roles' })
@Index(['companyId', 'name'], { unique: true })
export class RoleEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'is_protected', default: false, comment: 'System admin role - cannot be deactivated' })
  isProtected: boolean;

  @Column({ type: 'enum', enum: RoleStatus, default: RoleStatus.ACTIVE })
  status: RoleStatus;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @OneToMany(() => RolePermissionEntity, (perm) => perm.role, { cascade: true })
  permissions: RolePermissionEntity[];
}
