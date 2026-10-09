import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { OutboxRepository } from './outbox.repository';
import { KafkaProducer } from '../kafka/kafka.producer';
import { DlqHandler } from '../dlq/dlq.handler';

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessor.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  onModuleInit() {
    // Start background processing interval (every 2.5 seconds)
    this.timer = setInterval(() => {
      this.processPendingEvents().catch((err) => {
        this.logger.error(`Outbox worker loop error: ${err?.message || err}`);
      });
    }, 2500);
    this.logger.log('OutboxProcessor worker initialized');
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async processPendingEvents(): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;

    let processedCount = 0;
    try {
      const pending = await this.outboxRepository.findPendingEvents(25);
      for (const event of pending) {
        await this.outboxRepository.markProcessing(event.id);
        try {
          await this.kafkaProducer.emit(event.topic, event.event, {
            ...event.payload,
            companyId: event.companyId,
            outboxEventId: event.id,
          });
          await this.outboxRepository.markPublished(event.id);
          processedCount++;
        } catch (error: any) {
          const errMsg = error?.message || String(error);
          this.logger.warn(`Failed to dispatch outbox event ${event.id} to topic ${event.topic}: ${errMsg}`);
          await this.outboxRepository.markFailed(event.id, errMsg, event.retryCount);

          if (event.retryCount >= 4) {
            // Isolate to Dead Letter Queue
            await DlqHandler.handleFailure(
              {
                topic: event.topic,
                messageId: event.id,
                rawPayload: event.payload,
              },
              error,
              async (dlqTopic, dlqPayload) => {
                await this.kafkaProducer.emit(dlqTopic, 'OutboxDeadLetter', dlqPayload);
              },
            );
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return processedCount;
  }
}
