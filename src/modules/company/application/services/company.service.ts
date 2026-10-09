import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../../infrastructure/persistence/entities/company.entity';
import { FinancialYearEntity } from '../../infrastructure/persistence/entities/financial-year.entity';
import { GSTConfigEntity } from '../../infrastructure/persistence/entities/gst-config.entity';
import { FinancialYearStatus } from '../../domain/enums/company-status.enum';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { UpdateCompanyProfileDto, CloseFinancialYearDto, CreateGSTConfigDto } from '../../presentation/dtos/company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(FinancialYearEntity)
    private readonly fyRepo: Repository<FinancialYearEntity>,
    @InjectRepository(GSTConfigEntity)
    private readonly gstRepo: Repository<GSTConfigEntity>,
    private readonly outboxService: OutboxService,
  ) {}

  async getProfile(companyId: string): Promise<CompanyEntity> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company profile not found');
    return company;
  }

  async updateProfile(companyId: string, dto: UpdateCompanyProfileDto): Promise<CompanyEntity> {
    await this.companyRepo.update(companyId, dto);
    const updated = await this.getProfile(companyId);
    await this.outboxService.enqueue(
      companyId,
      EventTopics.COMPANY_EVENTS,
      DomainEvents.COMPANY_UPDATED,
      { companyId, dto },
    );
    return updated;
  }

  async listFinancialYears(companyId: string): Promise<FinancialYearEntity[]> {
    return this.fyRepo.find({ where: { companyId }, order: { startDate: 'DESC' } });
  }

  async closeFinancialYear(companyId: string, id: string, dto: CloseFinancialYearDto): Promise<FinancialYearEntity> {
    const fy = await this.fyRepo.findOne({ where: { id, companyId } });
    if (!fy) throw new NotFoundException('Financial year not found');
    if (fy.status === FinancialYearStatus.CLOSED) {
      throw new BadRequestException('Financial year is already closed');
    }

    fy.status = FinancialYearStatus.CLOSED;
    fy.closedAt = new Date();
    fy.closureReason = dto.reason;

    const saved = await this.fyRepo.save(fy);
    await this.outboxService.enqueue(
      companyId,
      EventTopics.COMPANY_EVENTS,
      DomainEvents.FINANCIAL_YEAR_CLOSED,
      { companyId, fyId: id, reason: dto.reason },
    );
    return saved;
  }

  async listGSTConfigs(companyId: string): Promise<GSTConfigEntity[]> {
    return this.gstRepo.find({ where: { companyId } });
  }

  async createGSTConfig(companyId: string, dto: CreateGSTConfigDto): Promise<GSTConfigEntity> {
    const config = this.gstRepo.create({ ...dto, companyId });
    return this.gstRepo.save(config);
  }
}
