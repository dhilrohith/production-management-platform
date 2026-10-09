import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '../../infrastructure/persistence/entities/role.entity';
import { RolePermissionEntity } from '../../infrastructure/persistence/entities/role-permission.entity';
import { UserStatus, RoleStatus } from '../../domain/enums/user-status.enum';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
} from '../../presentation/dtos/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly permRepo: Repository<RolePermissionEntity>,
    private readonly outboxService: OutboxService,
  ) {}

  async listUsers(companyId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const [data, total] = await this.userRepo.findAndCount({
      where: { companyId },
      relations: ['role'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async createUser(companyId: string, dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.userRepo.findOne({ where: { companyId, email: dto.email } });
    if (existing) throw new ConflictException('User with this email already exists in this organization');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
      companyId,
    });
    const saved = await this.userRepo.save(user);

    await this.outboxService.enqueue(
      companyId,
      EventTopics.USER_EVENTS,
      DomainEvents.USER_CREATED,
      { companyId, userId: saved.id, email: saved.email },
    );
    return saved;
  }

  async getUser(companyId: string, id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id, companyId }, relations: ['role', 'role.permissions'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(companyId: string, id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getUser(companyId, id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async deactivateUser(companyId: string, id: string): Promise<UserEntity> {
    const user = await this.getUser(companyId, id);
    if (user.isProtectedAdmin) {
      throw new BadRequestException('Primary system administrator cannot be deactivated');
    }
    user.status = UserStatus.INACTIVE;
    const saved = await this.userRepo.save(user);

    await this.outboxService.enqueue(
      companyId,
      EventTopics.USER_EVENTS,
      DomainEvents.USER_DEACTIVATED,
      { companyId, userId: id },
    );
    return saved;
  }

  // --- Roles & Permissions Management ---
  async listRoles(companyId: string): Promise<RoleEntity[]> {
    return this.roleRepo.find({ where: { companyId }, relations: ['permissions'] });
  }

  async createRole(companyId: string, dto: CreateRoleDto): Promise<RoleEntity> {
    const role = this.roleRepo.create({ name: dto.name, companyId });
    return this.roleRepo.save(role);
  }

  async getRole(companyId: string, id: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findOne({ where: { id, companyId }, relations: ['permissions'] });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async updateRole(companyId: string, id: string, dto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.getRole(companyId, id);
    Object.assign(role, dto);
    return this.roleRepo.save(role);
  }

  async deactivateRole(companyId: string, id: string): Promise<RoleEntity> {
    const role = await this.getRole(companyId, id);
    if (role.isProtected) {
      throw new BadRequestException('Protected administrative role cannot be deactivated');
    }
    role.status = RoleStatus.INACTIVE;
    return this.roleRepo.save(role);
  }

  async assignPermissions(companyId: string, roleId: string, dto: AssignPermissionsDto): Promise<RoleEntity> {
    await this.getRole(companyId, roleId);
    await this.permRepo.delete({ roleId });

    for (const p of dto.permissions) {
      const perm = this.permRepo.create({ roleId, module: p.module, actions: p.actions });
      await this.permRepo.save(perm);
    }

    await this.outboxService.enqueue(
      companyId,
      EventTopics.USER_EVENTS,
      DomainEvents.ROLE_PERMISSIONS_ASSIGNED,
      { companyId, roleId },
    );
    return this.getRole(companyId, roleId);
  }
}
