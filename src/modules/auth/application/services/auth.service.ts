import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../../users/infrastructure/persistence/entities/user.entity';
import { CompanyEntity } from '../../../company/infrastructure/persistence/entities/company.entity';
import { RoleEntity } from '../../../users/infrastructure/persistence/entities/role.entity';
import { FinancialYearEntity } from '../../../company/infrastructure/persistence/entities/financial-year.entity';
import { RefreshTokenEntity } from '../../infrastructure/persistence/entities/refresh-token.entity';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { RegisterCompanyDto, LoginDto } from '../../presentation/dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(FinancialYearEntity)
    private readonly fyRepo: Repository<FinancialYearEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly tokenRepo: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly outboxService: OutboxService,
  ) {}

  async registerCompany(dto: RegisterCompanyDto) {
    // 1. Create Company
    const company = this.companyRepo.create({
      legalName: dto.legalName,
      displayName: dto.displayName,
      state: dto.state,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
    });
    const savedCompany = await this.companyRepo.save(company);

    // 2. Create System Admin Role for Company
    const adminRole = this.roleRepo.create({
      companyId: savedCompany.id,
      name: 'Administrator',
      isProtected: true,
    });
    const savedRole = await this.roleRepo.save(adminRole);

    // 3. Create Primary Admin User
    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
    const adminUser = this.userRepo.create({
      companyId: savedCompany.id,
      name: dto.adminName,
      email: dto.adminEmail,
      password: hashedPassword,
      roleId: savedRole.id,
      isProtectedAdmin: true,
    });
    const savedUser = await this.userRepo.save(adminUser);

    // 4. Create Initial Financial Year
    const now = new Date();
    const currentYear = now.getFullYear();
    const fy = this.fyRepo.create({
      companyId: savedCompany.id,
      label: `FY${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
      startDate: new Date(currentYear, 3, 1),
      endDate: new Date(currentYear + 1, 2, 31),
    });
    await this.fyRepo.save(fy);

    await this.outboxService.enqueue(
      savedCompany.id,
      EventTopics.COMPANY_EVENTS,
      'CompanyRegistered',
      { companyId: savedCompany.id, adminEmail: savedUser.email },
    );

    const tokens = await this.generateTokens(savedUser.id, savedUser.email, savedCompany.id, savedRole.name);
    return {
      company: savedCompany,
      user: { id: savedUser.id, name: savedUser.name, email: savedUser.email },
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('User account is deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.companyId, user.role?.name || 'User');
    return { user: { id: user.id, name: user.name, email: user.email, companyId: user.companyId }, tokens };
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.tokenRepo.findOne({
      where: { isRevoked: false },
      relations: ['user', 'user.role'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = tokenRecord.user;
    return this.generateTokens(user.id, user.email, user.companyId, user.role?.name || 'User');
  }

  async logout(userId: string) {
    await this.tokenRepo.update({ userId }, { isRevoked: true, revokedAt: new Date() });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, companyId: string, roleName: string) {
    const payload = { sub: userId, email, companyId, role: roleName };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'super-secret-jwt-key-replace-in-production'),
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'super-secret-refresh-jwt-key-replace-in-production'),
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenRecord = this.tokenRepo.create({
      userId,
      companyId,
      tokenHash,
      expiresAt,
    });
    await this.tokenRepo.save(tokenRecord);

    return { accessToken, refreshToken };
  }
}
