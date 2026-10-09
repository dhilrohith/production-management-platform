import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { DashboardService } from '../../application/queries/dashboard.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get Operational Executive Dashboard KPIs' })
  getDashboard(@CompanyId() companyId: string) {
    return this.dashboardService.getDashboard(companyId);
  }

  @Get('profit')
  @ApiOperation({ summary: 'Get Real-Time Estimated Profit Analysis (Gross & Net)' })
  getEstimatedProfit(@CompanyId() companyId: string) {
    return this.dashboardService.getEstimatedProfit(companyId);
  }
}
