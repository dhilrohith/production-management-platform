import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducer.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor(private configService: ConfigService) {
    const broker = this.configService.get<string>('KAFKA_BROKER', 'localhost:9092');
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID', 'b2b-manufacturing-service');
    this.kafka = new Kafka({
      clientId,
      brokers: [broker],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka Producer connected successfully');
    } catch (error: any) {
      this.logger.warn(`Kafka Producer connection deferred: ${error?.message || error}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
    } catch (error: any) {
      this.logger.error(`Error disconnecting Kafka Producer: ${error?.message || error}`);
    }
  }

  async emit(topic: string, event: string, data: Record<string, any>): Promise<void> {
    try {
      const messagePayload = {
        event,
        timestamp: new Date().toISOString(),
        payload: data,
      };

      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(messagePayload) }],
      });
      this.logger.debug(`Kafka Event Published -> Topic: ${topic}, Event: ${event}`);
    } catch (error: any) {
      this.logger.warn(`Kafka emit failed for topic ${topic}: ${error?.message || error}`);
      throw error;
    }
  }
}
