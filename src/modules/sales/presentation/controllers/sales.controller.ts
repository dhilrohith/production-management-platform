import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { SalesService } from '../../application/services/sales.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreateSaleDto, CancelSaleDto } from '../dtos/sales.dto';

@ApiTags('Sales')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'List Sales Invoices with pagination & sorting' })
  listSales(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.salesService.listSales(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create & Confirm Sale Invoice (Deducts Batch Stock)' })
  createSale(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.salesService.createSale(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Sale Invoice Details' })
  getSale(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.salesService.getSale(companyId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel Sale Invoice & Revert Batch Allocations' })
  cancelSale(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelSaleDto,
  ) {
    return this.salesService.cancelSale(companyId, id, dto);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload Sale Invoice / Delivery Attachment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/sales',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  uploadAttachment(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    return this.salesService.uploadAttachment(companyId, userId, id, file);
  }
}
