import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategoryEntity } from './infrastructure/persistence/entities/expense-category.entity';
import { ExpenseEntity } from './infrastructure/persistence/entities/expense.entity';
import { AttachmentEntity } from '../../infrastructure/storage/attachment.entity';
import { ExpenseCategoriesController, ExpensesController } from './presentation/controllers/expenses.controller';
import { ExpensesService } from './application/services/expenses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpenseCategoryEntity,
      ExpenseEntity,
      AttachmentEntity,
    ]),
  ],
  controllers: [ExpenseCategoriesController, ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService, TypeOrmModule],
})
export class ExpensesModule {}
