import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CompanyService } from '../../application/services/company.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { UpdateCompanyProfileDto, CloseFinancialYearDto, CreateGSTConfigDto } from '../dtos/company.dto';

@ApiTags('Company Settings & Tenancy')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true, description: 'Tenant identifier' })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current tenant/company profile' })
  getProfile(@CompanyId() companyId: string) {
    return this.companyService.getProfile(companyId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update company settings' })
  updateProfile(@CompanyId() companyId: string, @Body() dto: UpdateCompanyProfileDto) {
    return this.companyService.updateProfile(companyId, dto);
  }

  @Get('financial-years')
  @ApiOperation({ summary: 'List financial years for tenant' })
  listFinancialYears(@CompanyId() companyId: string) {
    return this.companyService.listFinancialYears(companyId);
  }

  @Post('financial-years/:id/close')
  @ApiOperation({ summary: 'Close a financial year' })
  closeFinancialYear(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CloseFinancialYearDto,
  ) {
    return this.companyService.closeFinancialYear(companyId, id, dto);
  }

  @Get('gst-configs')
  @ApiOperation({ summary: 'List GST tax configurations' })
  listGSTConfigs(@CompanyId() companyId: string) {
    return this.companyService.listGSTConfigs(companyId);
  }

  @Post('gst-configs')
  @ApiOperation({ summary: 'Create GST tax configuration' })
  createGSTConfig(@CompanyId() companyId: string, @Body() dto: CreateGSTConfigDto) {
    return this.companyService.createGSTConfig(companyId, dto);
  }
}
