import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, LessThanOrEqual } from 'typeorm';
import { OutboxEventEntity, OutboxStatus } from './outbox-event.entity';

@Injectable()
export class OutboxRepository {
  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly repo: Repository<OutboxEventEntity>,
  ) {}

  async createEvent(
    companyId: string,
    topic: string,
    event: string,
    payload: Record<string, any>,
    manager?: EntityManager,
  ): Promise<OutboxEventEntity> {
    const repository = manager ? manager.getRepository(OutboxEventEntity) : this.repo;
    const outboxEvent = repository.create({
      companyId,
      topic,
      event,
      payload,
      status: OutboxStatus.PENDING,
      retryCount: 0,
    });
    return repository.save(outboxEvent);
  }

  async findPendingEvents(limit: number = 50): Promise<OutboxEventEntity[]> {
    return this.repo.find({
      where: {
        status: OutboxStatus.PENDING,
      },
      order: {
        createdAt: 'ASC',
      },
      take: limit,
    });
  }

  async markProcessing(id: string): Promise<void> {
    await this.repo.update(id, { status: OutboxStatus.PROCESSING });
  }

  async markPublished(id: string): Promise<void> {
    await this.repo.update(id, {
      status: OutboxStatus.PUBLISHED,
      processedAt: new Date(),
    });
  }

  async markFailed(id: string, errorMessage: string, retryCount: number): Promise<void> {
    const maxRetries = 5;
    const status = retryCount >= maxRetries ? OutboxStatus.FAILED : OutboxStatus.PENDING;
    await this.repo.update(id, {
      status,
      errorMessage,
      retryCount: retryCount + 1,
    });
  }
}
