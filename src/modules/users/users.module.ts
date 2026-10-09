import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { RoleEntity } from './infrastructure/persistence/entities/role.entity';
import { RolePermissionEntity } from './infrastructure/persistence/entities/role-permission.entity';
import { UsersController } from './presentation/controllers/users.controller';
import { UsersService } from './application/services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      RolePermissionEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
