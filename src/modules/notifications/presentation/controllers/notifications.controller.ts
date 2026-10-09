import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { NotificationsService } from '../../application/services/notifications.service';
import { CompanyId } from '../../../../common/decorators/company-id.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CompanyTenantGuard } from '../../../../common/guards/company-tenant.guard';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Company-ID', required: true })
@UseGuards(JwtAuthGuard, CompanyTenantGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List In-App Notifications with pagination & sorting' })
  listNotifications(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.notificationsService.listNotifications(companyId, userId, pagination);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark Notification as Read' })
  markAsRead(
    @CompanyId() companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(companyId, userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark All User Notifications as Read' })
  markAllAsRead(@CompanyId() companyId: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(companyId, userId);
  }
}
