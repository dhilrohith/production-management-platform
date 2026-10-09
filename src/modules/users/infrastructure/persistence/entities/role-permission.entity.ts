import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { RoleEntity } from './role.entity';

@Entity({ name: 'role_permissions' })
@Index(['roleId', 'module'], { unique: true })
export class RolePermissionEntity extends AbstractBaseEntity {
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ length: 100 })
  module: string;

  @Column({ type: 'simple-array', comment: 'e.g. create, view, update, cancel' })
  actions: string[];

  @ManyToOne(() => RoleEntity, (role) => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
}
