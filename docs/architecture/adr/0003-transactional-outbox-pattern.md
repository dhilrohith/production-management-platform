# ADR 0003: Transactional Outbox Pattern for Asynchronous Events

## Status
Accepted

## Context
Previously, domain services published events directly to Apache Kafka (`kafkaProducer.emit(...)`) inside database transactions. If Kafka was unreachable or slow, the database transaction would fail or block; conversely, if the database transaction committed but Kafka crashed before publication, events were lost (dual-write consistency hazard).

## Decision
We implemented the **Transactional Outbox Pattern**:
1. Business data and domain events are persisted in the same PostgreSQL transaction:
   - Business state written to business tables.
   - Outbox event written to `outbox_events` table (`status: PENDING`).
2. An asynchronous worker (`OutboxProcessor`) polls `outbox_events` every 2.5 seconds, dispatches messages to Kafka, and updates event status to `PUBLISHED`.
3. If publishing fails up to 4 retry attempts, the event is marked `FAILED` and routed to the Dead Letter Queue (`dlq.handler.ts`).

## Consequences
### Positive
- Guaranteed at-least-once message delivery.
- Database transactions are completely isolated from Kafka availability and network latency.
- Full auditability of all emitted domain events in PostgreSQL.

### Negative
- Event consumers must be idempotent because at-least-once delivery may result in duplicate message processing during network partitions.
