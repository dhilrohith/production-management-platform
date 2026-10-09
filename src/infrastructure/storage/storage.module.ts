import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local/local-storage.service';
import { S3StorageService } from './s3/s3-storage.service';
import { STORAGE_SERVICE_TOKEN } from './storage.interface';

@Global()
@Module({
  providers: [
    LocalStorageService,
    S3StorageService,
    {
      provide: STORAGE_SERVICE_TOKEN,
      useFactory: (configService: ConfigService, local: LocalStorageService, s3: S3StorageService) => {
        const driver = configService.get<string>('STORAGE_DRIVER', 'local');
        return driver === 's3' ? s3 : local;
      },
      inject: [ConfigService, LocalStorageService, S3StorageService],
    },
  ],
  exports: [STORAGE_SERVICE_TOKEN, LocalStorageService],
})
export class StorageInfrastructureModule {}
