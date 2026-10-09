import { Entity, Column, Index } from 'typeorm';
import { AbstractBaseEntity } from '../database/abstract-base.entity';

export enum AttachmentReferenceType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
}

@Entity({ name: 'attachments' })
@Index(['referenceId', 'referenceType'])
export class AttachmentEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'reference_id', type: 'uuid' })
  referenceId: string;

  @Column({ name: 'reference_type', type: 'enum', enum: AttachmentReferenceType })
  referenceType: AttachmentReferenceType;

  @Column({ name: 'original_filename', length: 255 })
  originalFilename: string;

  @Column({ name: 'storage_path', length: 512 })
  storagePath: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;
}
