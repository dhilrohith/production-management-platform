import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../../../infrastructure/database/abstract-base.entity';
import { RawMaterialVariantEntity } from '../../../../materials/infrastructure/persistence/entities/raw-material-variant.entity';
import { InventoryMovementType } from '../../../domain/enums/inventory.enums';

@Entity({ name: 'inventory_movements' })
@Index(['companyId', 'variantId', 'movementDate'])
export class InventoryMovementEntity extends AbstractBaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'movement_type', type: 'enum', enum: InventoryMovementType })
  movementType: InventoryMovementType;

  @Column({ name: 'quantity_change', type: 'decimal', precision: 18, scale: 6, comment: 'Positive = IN; Negative = OUT' })
  quantityChange: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 2 })
  unitCost: number;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'reference_id', type: 'uuid' })
  referenceId: string;

  @Column({ name: 'reference_type', length: 50 })
  referenceType: string;

  @Column({ name: 'movement_date', type: 'date' })
  movementDate: Date;

  @ManyToOne(() => RawMaterialVariantEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'variant_id' })
  variant: RawMaterialVariantEntity;
}
