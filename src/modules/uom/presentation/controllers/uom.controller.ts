import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { UOMService } from '../../application/services/uom.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateUOMDto, UpdateUOMDto, CreateConversionDto, UpdateConversionDto } from '../dtos/uom.dto';

@ApiTags('Units of Measurement (UOM)')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('uoms')
export class UOMController {
  constructor(private readonly uomService: UOMService) {}

  @Get()
  @ApiOperation({ summary: 'List Units of Measure' })
  listUOMs(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.uomService.listUOMs(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create Unit of Measure' })
  createUOM(@CompanyId() companyId: string, @Body() dto: CreateUOMDto) {
    return this.uomService.createUOM(companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Unit of Measure' })
  updateUOM(@CompanyId() companyId: string, @Param('id') id: string, @Body() dto: UpdateUOMDto) {
    return this.uomService.updateUOM(companyId, id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate Unit of Measure' })
  deactivateUOM(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.uomService.deactivateUOM(companyId, id);
  }

  @Get(':id/conversions')
  @ApiOperation({ summary: 'List conversion factors from base UOM' })
  listConversions(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.uomService.listConversions(companyId, id);
  }

  @Post(':id/conversions')
  @ApiOperation({ summary: 'Create conversion ratio between UOMs' })
  createConversion(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CreateConversionDto,
  ) {
    return this.uomService.createConversion(companyId, id, dto);
  }

  @Put(':id/conversions/:convId')
  @ApiOperation({ summary: 'Update conversion factor' })
  updateConversion(
    @CompanyId() companyId: string,
    @Param('convId') convId: string,
    @Body() dto: UpdateConversionDto,
  ) {
    return this.uomService.updateConversion(companyId, convId, dto);
  }
}
