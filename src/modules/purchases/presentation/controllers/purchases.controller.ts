import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { PurchasesService } from '../../application/services/purchases.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { CreatePurchaseDto, CancelPurchaseDto } from '../dtos/purchases.dto';

@ApiTags('Purchases')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @ApiOperation({ summary: 'List Purchases with pagination & sorting' })
  listPurchases(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.purchasesService.listPurchases(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create & Confirm Purchase Order' })
  createPurchase(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.purchasesService.createPurchase(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Purchase Details' })
  getPurchase(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.purchasesService.getPurchase(companyId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel Purchase Order & Reverse Stock' })
  cancelPurchase(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelPurchaseDto,
  ) {
    return this.purchasesService.cancelPurchase(companyId, id, dto);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload Purchase Bill Attachment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/purchases',
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
    return this.purchasesService.uploadAttachment(companyId, userId, id, file);
  }
}
