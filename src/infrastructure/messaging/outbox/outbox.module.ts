import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEventEntity } from './outbox-event.entity';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';
import { KafkaInfrastructureModule } from '../kafka/kafka.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([OutboxEventEntity]),
    KafkaInfrastructureModule,
  ],
  providers: [
    OutboxRepository,
    OutboxService,
    OutboxProcessor,
  ],
  exports: [
    OutboxRepository,
    OutboxService,
    TypeOrmModule,
  ],
})
export class OutboxModule {}
