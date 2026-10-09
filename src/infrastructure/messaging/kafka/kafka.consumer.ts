import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { DlqHandler } from '../dlq/dlq.handler';
import { KafkaProducer } from './kafka.producer';

@Injectable()
export class KafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumer.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private configService: ConfigService,
    private kafkaProducer: KafkaProducer,
  ) {
    const broker = this.configService.get<string>('KAFKA_BROKER', 'localhost:9092');
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID', 'b2b-manufacturing-service');
    const groupId = this.configService.get<string>('KAFKA_GROUP_ID', 'b2b-manufacturing-group');

    this.kafka = new Kafka({
      clientId,
      brokers: [broker],
    });
    this.consumer = this.kafka.consumer({ groupId });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.logger.log('Kafka Consumer connected successfully');
    } catch (error: any) {
      this.logger.warn(`Kafka Consumer connection deferred or unavailable: ${error?.message || error}`);
    }
  }

  async subscribe(topics: string[], callback: (topic: string, message: any) => Promise<void>) {
    try {
      for (const topic of topics) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
      }
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          let value: any = null;
          try {
            value = message.value ? JSON.parse(message.value.toString()) : null;
            await callback(topic, value);
          } catch (error) {
            await DlqHandler.handleFailure(
              {
                topic,
                partition,
                offset: message.offset,
                messageId: message.key ? message.key.toString() : undefined,
                rawPayload: message.value ? message.value.toString() : null,
              },
              error,
              async (dlqTopic, payload) => {
                await this.kafkaProducer.emit(dlqTopic, 'DeadLetterMessage', payload);
              },
            );
          }
        },
      });
    } catch (error: any) {
      this.logger.warn(`Kafka Consumer subscription deferred: ${error?.message || error}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
    } catch (error: any) {
      this.logger.error(`Error disconnecting Kafka Consumer: ${error?.message || error}`);
    }
  }
}
