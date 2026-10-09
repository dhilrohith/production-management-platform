import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { FileUploadInput, IStorageService, StoredFileResult } from '../storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath: string;

  constructor(private readonly configService: ConfigService) {
    this.basePath = this.configService.get<string>('STORAGE_PATH', './uploads');
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  async uploadFile(file: FileUploadInput): Promise<StoredFileResult> {
    const targetDir = file.subfolder
      ? path.join(this.basePath, file.subfolder)
      : this.basePath;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${file.originalFilename.replace(/\s+/g, '_')}`;
    const destinationPath = path.join(targetDir, uniqueName);

    await fs.promises.writeFile(destinationPath, file.buffer);
    this.logger.debug(`File stored locally at: ${destinationPath}`);

    return {
      storagePath: destinationPath,
      originalFilename: file.originalFilename,
      mimeType: file.mimeType,
      sizeBytes: file.size,
      url: `/uploads/${file.subfolder ? file.subfolder + '/' : ''}${uniqueName}`,
    };
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(storagePath)) {
        await fs.promises.unlink(storagePath);
        return true;
      }
      return false;
    } catch (error: any) {
      this.logger.warn(`Failed to delete local file ${storagePath}: ${error?.message || error}`);
      return false;
    }
  }

  async getDownloadStream(storagePath: string): Promise<NodeJS.ReadableStream> {
    if (!fs.existsSync(storagePath)) {
      throw new Error(`File not found: ${storagePath}`);
    }
    return fs.createReadStream(storagePath);
  }
}
