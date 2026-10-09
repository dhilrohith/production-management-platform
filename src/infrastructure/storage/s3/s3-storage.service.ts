import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUploadInput, IStorageService, StoredFileResult } from '../storage.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'mfg-uploads');
  }

  async uploadFile(file: FileUploadInput): Promise<StoredFileResult> {
    const key = `${file.subfolder ? file.subfolder + '/' : ''}${Date.now()}-${file.originalFilename}`;
    this.logger.log(`[S3-Mock] Storing file ${file.originalFilename} in bucket ${this.bucket} at key ${key}`);

    return {
      storagePath: `s3://${this.bucket}/${key}`,
      originalFilename: file.originalFilename,
      mimeType: file.mimeType,
      sizeBytes: file.size,
      url: `https://${this.bucket}.s3.amazonaws.com/${key}`,
    };
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    this.logger.log(`[S3-Mock] Deleting file from S3: ${storagePath}`);
    return true;
  }
}
