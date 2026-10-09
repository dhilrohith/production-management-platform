import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { ExpensesService } from '../../application/services/expenses.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  CreateExpenseDto,
  CancelExpenseDto,
} from '../dtos/expenses.dto';

@ApiTags('Expense Categories')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List Expense Categories' })
  listCategories(@CompanyId() companyId: string) {
    return this.expensesService.listCategories(companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create Expense Category' })
  createCategory(@CompanyId() companyId: string, @Body() dto: CreateExpenseCategoryDto) {
    return this.expensesService.createCategory(companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Expense Category' })
  updateCategory(@CompanyId() companyId: string, @Param('id') id: string, @Body() dto: UpdateExpenseCategoryDto) {
    return this.expensesService.updateCategory(companyId, id, dto);
  }
}

@ApiTags('Expenses')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List Expenses with pagination & sorting' })
  listExpenses(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.expensesService.listExpenses(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create Expense Entry' })
  createExpense(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.createExpense(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Expense Details' })
  getExpense(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.expensesService.getExpense(companyId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel Expense Entry' })
  cancelExpense(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelExpenseDto,
  ) {
    return this.expensesService.cancelExpense(companyId, id, dto);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload Expense Receipt Attachment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/expenses',
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
    return this.expensesService.uploadAttachment(companyId, userId, id, file);
  }
}
