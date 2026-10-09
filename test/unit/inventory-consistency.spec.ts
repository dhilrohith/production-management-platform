import { InventoryService } from '../../src/modules/inventory/application/services/inventory.service';
import { InsufficientStockException } from '../../src/common/exceptions/domain.exception';
import { IInventoryRepository } from '../../src/modules/inventory/domain/repositories/inventory.repository.interface';
import { OutboxService } from '../../src/infrastructure/messaging/outbox/outbox.service';

describe('Inventory Consistency Domain Logic', () => {
  let inventoryService: InventoryService;
  let mockInventoryRepo: jest.Mocked<IInventoryRepository>;
  let mockDataSource: any;
  let mockOutboxService: jest.Mocked<OutboxService>;

  beforeEach(() => {
    mockInventoryRepo = {
      findStockAndCount: jest.fn(),
      findStockByVariant: jest.fn(),
      saveStock: jest.fn().mockImplementation((stock) => Promise.resolve(stock)),
      findMovementsAndCount: jest.fn(),
      saveMovement: jest.fn().mockImplementation((mov) => Promise.resolve(mov)),
      findAdjustmentsAndCount: jest.fn(),
      findAdjustmentById: jest.fn(),
      saveAdjustment: jest.fn().mockImplementation((adj) => Promise.resolve(adj)),
    } as any;

    mockDataSource = {
      manager: {
        create: jest.fn().mockImplementation((cls, data) => ({ ...data })),
      },
      createQueryRunner: jest.fn(),
    };

    mockOutboxService = {
      enqueue: jest.fn().mockResolvedValue({} as any),
    } as any;

    inventoryService = new InventoryService(mockInventoryRepo, mockDataSource, mockOutboxService);
  });

  it('should calculate Weighted Average Cost correctly on receiving stock', async () => {
    const companyId = 'comp-1';
    const variantId = 'var-1';

    // Existing: 10 units at $5.00/unit = $50.00 total
    mockInventoryRepo.findStockByVariant.mockResolvedValue({
      id: 'stock-1',
      companyId,
      variantId,
      usableQuantity: 10,
      weightedAverageCost: 5,
    } as any);

    // Receive 10 new units at $15.00/unit = $150.00
    // New total: 20 units, Total value: $200.00, New WAC: $10.00
    const result = await inventoryService.receiveStock(
      companyId,
      variantId,
      10,
      15,
      'pur-123',
      'PURCHASE',
    );

    expect(result.usableQuantity).toBe(20);
    expect(result.weightedAverageCost).toBe(10);
    expect(mockInventoryRepo.saveStock).toHaveBeenCalled();
  });

  it('should throw InsufficientStockException when consuming more than available quantity', async () => {
    const companyId = 'comp-1';
    const variantId = 'var-1';

    mockInventoryRepo.findStockByVariant.mockResolvedValue({
      id: 'stock-1',
      companyId,
      variantId,
      usableQuantity: 5,
      weightedAverageCost: 10,
    } as any);

    await expect(
      inventoryService.consumeStock(companyId, variantId, 10, 'prod-1', 'PRODUCTION'),
    ).rejects.toThrow(InsufficientStockException);
  });

  it('should correctly decrement usable quantity when stock is sufficient', async () => {
    const companyId = 'comp-1';
    const variantId = 'var-1';

    mockInventoryRepo.findStockByVariant.mockResolvedValue({
      id: 'stock-1',
      companyId,
      variantId,
      usableQuantity: 25,
      weightedAverageCost: 4.5,
    } as any);

    const result = await inventoryService.consumeStock(companyId, variantId, 10, 'prod-1', 'PRODUCTION');

    expect(result.consumedQuantity).toBe(10);
    expect(result.unitCost).toBe(4.5);
    expect(result.totalCost).toBe(45);
    expect(mockInventoryRepo.saveStock).toHaveBeenCalledWith(
      expect.objectContaining({ usableQuantity: 15 }),
      expect.anything(),
    );
  });
});
