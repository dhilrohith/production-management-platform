import { OutboxProcessor } from '../../src/infrastructure/messaging/outbox/outbox.processor';
import { OutboxStatus } from '../../src/infrastructure/messaging/outbox/outbox-event.entity';

describe('Transactional Outbox Processor & DLQ Reliability', () => {
  let outboxProcessor: OutboxProcessor;
  let mockOutboxRepo: any;
  let mockKafkaProducer: any;

  beforeEach(() => {
    mockOutboxRepo = {
      findPendingEvents: jest.fn(),
      markProcessing: jest.fn().mockResolvedValue(undefined),
      markPublished: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };

    mockKafkaProducer = {
      emit: jest.fn().mockResolvedValue(undefined),
    };

    outboxProcessor = new OutboxProcessor(mockOutboxRepo, mockKafkaProducer);
  });

  it('should publish pending outbox events to Kafka and mark them PUBLISHED', async () => {
    const mockEvents = [
      {
        id: 'evt-1',
        companyId: 'comp-1',
        topic: 'inventory.events',
        event: 'StockAdjusted',
        payload: { variantId: 'v1', qty: 10 },
        retryCount: 0,
        status: OutboxStatus.PENDING,
      },
    ];

    mockOutboxRepo.findPendingEvents.mockResolvedValue(mockEvents);

    const count = await outboxProcessor.processPendingEvents();

    expect(count).toBe(1);
    expect(mockOutboxRepo.markProcessing).toHaveBeenCalledWith('evt-1');
    expect(mockKafkaProducer.emit).toHaveBeenCalledWith(
      'inventory.events',
      'StockAdjusted',
      expect.objectContaining({
        variantId: 'v1',
        qty: 10,
        companyId: 'comp-1',
        outboxEventId: 'evt-1',
      }),
    );
    expect(mockOutboxRepo.markPublished).toHaveBeenCalledWith('evt-1');
  });

  it('should mark event as failed and record error message when dispatch fails', async () => {
    const failingEvent = {
      id: 'evt-fail',
      companyId: 'comp-1',
      topic: 'production.events',
      event: 'ProductionConfirmed',
      payload: { prodId: 'p1' },
      retryCount: 1,
      status: OutboxStatus.PENDING,
    };

    mockOutboxRepo.findPendingEvents.mockResolvedValue([failingEvent]);
    mockKafkaProducer.emit.mockRejectedValue(new Error('Kafka broker connection refused'));

    const count = await outboxProcessor.processPendingEvents();

    expect(count).toBe(0);
    expect(mockOutboxRepo.markFailed).toHaveBeenCalledWith(
      'evt-fail',
      'Kafka broker connection refused',
      1,
    );
  });
});
