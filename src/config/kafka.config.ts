import { registerAs } from '@nestjs/config';

export const kafkaConfig = registerAs('kafka', () => ({
  broker: process.env.KAFKA_BROKER || 'localhost:9092',
  clientId: process.env.KAFKA_CLIENT_ID || 'b2b-manufacturing-service',
  groupId: process.env.KAFKA_GROUP_ID || 'b2b-manufacturing-group',
}));
