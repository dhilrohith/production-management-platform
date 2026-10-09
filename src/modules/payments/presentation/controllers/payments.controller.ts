import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from '../../application/services/payments.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import {
  CreateCustomerPaymentDto,
  CancelCustomerPaymentDto,
  CreateSupplierPaymentDto,
  CancelSupplierPaymentDto,
} from '../dtos/payments.dto';

@ApiTags('Payments - Customer')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('payments/customer')
export class CustomerPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List Customer Payments' })
  listCustomerPayments(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.paymentsService.listCustomerPayments(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Record Customer Receipt (Reduces Customer Outstanding)' })
  createCustomerPayment(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCustomerPaymentDto,
  ) {
    return this.paymentsService.createCustomerPayment(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Customer Payment Details' })
  getCustomerPayment(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.paymentsService.getCustomerPayment(companyId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel Customer Payment & Revert Outstanding' })
  cancelCustomerPayment(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelCustomerPaymentDto,
  ) {
    return this.paymentsService.cancelCustomerPayment(companyId, id, dto);
  }
}

@ApiTags('Payments - Supplier')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('payments/supplier')
export class SupplierPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List Supplier Payments' })
  listSupplierPayments(@CompanyId() companyId: string, @Query() pagination: PaginationQueryDto) {
    return this.paymentsService.listSupplierPayments(companyId, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Record Supplier Payment (Reduces Supplier Payable)' })
  createSupplierPayment(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSupplierPaymentDto,
  ) {
    return this.paymentsService.createSupplierPayment(companyId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Supplier Payment Details' })
  getSupplierPayment(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.paymentsService.getSupplierPayment(companyId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel Supplier Payment & Revert Payable' })
  cancelSupplierPayment(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelSupplierPaymentDto,
  ) {
    return this.paymentsService.cancelSupplierPayment(companyId, id, dto);
  }
}
