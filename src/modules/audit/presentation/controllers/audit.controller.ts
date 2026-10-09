import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuditService } from '../../application/services/audit.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { AuditFilterDto } from '../dtos/audit.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List Company Audit Trail Logs with pagination, sorting & filters' })
  listAuditLogs(
    @CompanyId() companyId: string,
    @Query() query: AuditFilterDto,
  ) {
    const { userId, action, entity, ...pagination } = query;
    return this.auditService.listAuditLogs(companyId, pagination, { userId, action, entity });
  }
}
