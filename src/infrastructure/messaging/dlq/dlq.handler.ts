import { Logger } from '@nestjs/common';

export interface QueuedMessageContext {
  topic: string;
  partition?: number;
  offset?: string;
  messageId?: string;
  rawPayload: any;
}

export class DlqHandler {
  private static readonly logger = new Logger(DlqHandler.name);

  static async handleFailure(
    context: QueuedMessageContext,
    error: any,
    dlqPublisher?: (dlqTopic: string, payload: any) => Promise<void>,
  ): Promise<void> {
    const dlqTopic = `${context.topic}.DLQ`;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    this.logger.error(
      `[DLQ-Catch] Message processing failed on topic '${context.topic}' (Offset: ${context.offset}, ID: ${context.messageId}). Error: ${errorMessage}`,
      stackTrace,
    );

    const dlqPayload = {
      originalTopic: context.topic,
      partition: context.partition,
      offset: context.offset,
      messageId: context.messageId,
      failedAt: new Date().toISOString(),
      error: errorMessage,
      payload: context.rawPayload,
    };

    if (dlqPublisher) {
      try {
        await dlqPublisher(dlqTopic, dlqPayload);
        this.logger.warn(`[DLQ-Route] Isolated poison message to Dead Letter Queue topic: ${dlqTopic}`);
      } catch (dlqError: any) {
        this.logger.error(
          `[DLQ-Fail] Failed to publish message to DLQ topic '${dlqTopic}': ${dlqError?.message || dlqError}`,
        );
      }
    } else {
      this.logger.warn(
        `[DLQ-Fallback] No DLQ publisher configured. Poison message logged and skipped to prevent consumer stall. Payload: ${JSON.stringify(dlqPayload)}`,
      );
    }
  }
}
