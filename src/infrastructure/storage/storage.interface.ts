export interface StoredFileResult {
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
}

export interface FileUploadInput {
  originalFilename: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
  subfolder?: string;
}

export interface IStorageService {
  uploadFile(file: FileUploadInput): Promise<StoredFileResult>;
  deleteFile(storagePath: string): Promise<boolean>;
  getDownloadStream?(storagePath: string): Promise<NodeJS.ReadableStream>;
}

export const STORAGE_SERVICE_TOKEN = 'IStorageService';
