import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { kafkaConfig } from './kafka.config';
import { redisConfig } from './redis.config';
import { storageConfig } from './storage.config';

export const appConfigurations = [
  databaseConfig,
  jwtConfig,
  kafkaConfig,
  redisConfig,
  storageConfig,
];
