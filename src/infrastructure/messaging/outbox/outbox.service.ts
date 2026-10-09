import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OutboxRepository } from './outbox.repository';
import { OutboxEventEntity } from './outbox-event.entity';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly outboxRepository: OutboxRepository) {}

  /**
   * Enqueues an integration event into the transactional outbox table.
   * If a transaction manager is provided, the outbox record commits atomically with business data.
   */
  async enqueue(
    companyId: string,
    topic: string,
    event: string,
    payload: Record<string, any>,
    manager?: EntityManager,
  ): Promise<OutboxEventEntity> {
    const outboxEvent = await this.outboxRepository.createEvent(
      companyId,
      topic,
      event,
      payload,
      manager,
    );
    this.logger.debug(`Enqueued outbox event '${event}' for topic '${topic}' [Tenant: ${companyId}]`);
    return outboxEvent;
  }
}
