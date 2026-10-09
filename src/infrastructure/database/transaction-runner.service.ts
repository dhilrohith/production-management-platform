import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionRunnerService {
  private readonly logger = new Logger(TransactionRunnerService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Executes a callback within a managed database transaction.
   * Handles connect, startTransaction, commit, rollback, and release automatically.
   */
  async runInTransaction<T>(
    operation: (manager: EntityManager, queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner.manager, queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      this.logger.error(`Transaction rollback due to error: ${(error as any)?.message || error}`);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
