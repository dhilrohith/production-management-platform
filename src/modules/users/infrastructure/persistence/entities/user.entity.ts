import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { CompanyEntity } from '../../../../company/infrastructure/persistence/entities/company.entity';
import { RoleEntity } from './role.entity';
import { UserStatus } from '../../../domain/enums/user-status.enum';

@Entity({ name: 'users' })
@Index(['companyId', 'email'], { unique: true })
export class UserEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'password_hash', select: false, comment: 'bcrypt hash' })
  password: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'is_protected_admin', default: false, comment: 'Primary admin user created on company registration' })
  isProtectedAdmin: boolean;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @ManyToOne(() => RoleEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
}
