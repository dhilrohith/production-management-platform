import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { BomService } from '../../application/services/bom.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateBOMDto, UpdateBOMDto } from '../dtos/bom.dto';

@ApiTags('Bill of Materials (BOM)')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('boms')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Get()
  @ApiOperation({ summary: 'List Bill of Materials (BOM)' })
  listBOMs(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.bomService.listBOMs(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create Bill of Materials recipe' })
  createBOM(@CompanyId() companyId: string, @Body() dto: CreateBOMDto) {
    return this.bomService.createBOM(companyId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get BOM Details with raw material recipe requirements' })
  getBOM(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.bomService.getBOM(companyId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update BOM recipe lines' })
  updateBOM(@CompanyId() companyId: string, @Param('id') id: string, @Body() dto: UpdateBOMDto) {
    return this.bomService.updateBOM(companyId, id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate BOM' })
  deactivateBOM(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.bomService.deactivateBOM(companyId, id);
  }
}
