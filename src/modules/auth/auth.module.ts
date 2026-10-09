import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshTokenEntity } from './infrastructure/persistence/entities/refresh-token.entity';
import { UserEntity } from '../users/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '../users/infrastructure/persistence/entities/role.entity';
import { CompanyEntity } from '../company/infrastructure/persistence/entities/company.entity';
import { FinancialYearEntity } from '../company/infrastructure/persistence/entities/financial-year.entity';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'super-secret-jwt-key-replace-in-production'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
    }),
    TypeOrmModule.forFeature([
      RefreshTokenEntity,
      UserEntity,
      RoleEntity,
      CompanyEntity,
      FinancialYearEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
