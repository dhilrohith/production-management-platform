import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { SearchService } from '../../application/services/search.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { GlobalSearchDto, SearchMaterialsDto, SearchTransactionsDto } from '../dtos/search.dto';

@ApiTags('Search')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  @ApiOperation({ summary: 'Multi-Tenant Global Full-Text Search' })
  globalSearch(
    @CompanyId() companyId: string,
    @Query() dto: GlobalSearchDto,
  ) {
    return this.searchService.globalSearch(companyId, dto.q, dto.limit || 20);
  }

  @Get('materials')
  @ApiOperation({ summary: 'Search Raw Materials and Variants' })
  searchMaterials(
    @CompanyId() companyId: string,
    @Query() dto: SearchMaterialsDto,
  ) {
    return this.searchService.searchMaterials(companyId, dto.q, dto.uomId);
  }

  @Get('products')
  @ApiOperation({ summary: 'Search Finished Products and Variants' })
  searchProducts(
    @CompanyId() companyId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.searchProducts(companyId, query);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Search Across Purchases, Sales & Production Runs' })
  searchTransactions(
    @CompanyId() companyId: string,
    @Query() dto: SearchTransactionsDto,
  ) {
    return this.searchService.searchTransactions(companyId, dto.q, dto.type);
  }
}
