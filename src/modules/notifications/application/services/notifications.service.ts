import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../infrastructure/persistence/entities/notification.entity';
import { NotificationStatus, NotificationType } from '../../domain/enums/notification.enums';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifRepo: Repository<NotificationEntity>,
  ) {}

  async listNotifications(companyId: string, userId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const [data, total] = await this.notifRepo.findAndCount({
      where: { companyId, userId },
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async markAsRead(companyId: string, userId: string, id: string): Promise<NotificationEntity> {
    const notif = await this.notifRepo.findOne({ where: { id, companyId, userId } });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.status = NotificationStatus.READ;
    notif.readAt = new Date();
    return this.notifRepo.save(notif);
  }

  async markAllAsRead(companyId: string, userId: string): Promise<{ updatedCount: number }> {
    const result = await this.notifRepo.update(
      { companyId, userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
    return { updatedCount: result.affected || 0 };
  }

  async createNotification(
    companyId: string,
    userId: string,
    type: NotificationType,
    message: string,
    referenceId?: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90-day retention rule

    const notif = this.notifRepo.create({
      companyId,
      userId,
      type,
      message,
      referenceId,
      expiresAt,
    });
    return this.notifRepo.save(notif);
  }
}
