import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseCategoryEntity } from '../../infrastructure/persistence/entities/expense-category.entity';
import { ExpenseEntity } from '../../infrastructure/persistence/entities/expense.entity';
import { AttachmentEntity, AttachmentReferenceType } from '../../../../infrastructure/storage/attachment.entity';
import { TransactionStatus } from '../../../../common/enums/transaction-status.enum';
import { OutboxService } from '../../../../infrastructure/messaging/outbox/outbox.service';
import { EventTopics, DomainEvents } from '../../../../common/constants/events.constant';
import { PaginationQueryDto } from '../../../../common/dtos/pagination.dto';
import { STORAGE_SERVICE_TOKEN, IStorageService } from '../../../../infrastructure/storage/storage.interface';
import {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  CreateExpenseDto,
  CancelExpenseDto,
} from '../../presentation/dtos/expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpenseCategoryEntity)
    private readonly categoryRepo: Repository<ExpenseCategoryEntity>,
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepo: Repository<ExpenseEntity>,
    @InjectRepository(AttachmentEntity)
    private readonly attachRepo: Repository<AttachmentEntity>,
    private readonly outboxService: OutboxService,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  async listCategories(companyId: string): Promise<ExpenseCategoryEntity[]> {
    return this.categoryRepo.find({ where: { companyId } });
  }

  async createCategory(companyId: string, dto: CreateExpenseCategoryDto): Promise<ExpenseCategoryEntity> {
    const category = this.categoryRepo.create({ name: dto.name, companyId });
    return this.categoryRepo.save(category);
  }

  async updateCategory(companyId: string, id: string, dto: UpdateExpenseCategoryDto): Promise<ExpenseCategoryEntity> {
    const category = await this.categoryRepo.findOne({ where: { id, companyId } });
    if (!category) throw new NotFoundException('Expense category not found');
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async listExpenses(companyId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const [data, total] = await this.expenseRepo.findAndCount({
      where: { companyId },
      relations: ['category'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getExpense(companyId: string, id: string): Promise<ExpenseEntity> {
    const expense = await this.expenseRepo.findOne({ where: { id, companyId }, relations: ['category'] });
    if (!expense) throw new NotFoundException('Expense record not found');
    return expense;
  }

  async createExpense(companyId: string, userId: string, dto: CreateExpenseDto): Promise<ExpenseEntity> {
    const expense = this.expenseRepo.create({
      financialYearId: dto.financialYearId,
      date: dto.date ? new Date(dto.date) : new Date(),
      categoryId: dto.categoryId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      description: dto.description,
      companyId,
      createdBy: userId,
      status: TransactionStatus.CONFIRMED,
    });
    const saved = await this.expenseRepo.save(expense);

    await this.outboxService.enqueue(
      companyId,
      EventTopics.EXPENSE_EVENTS,
      DomainEvents.EXPENSE_CREATED,
      { companyId, expenseId: saved.id, amount: saved.amount },
    );
    return saved;
  }

  async cancelExpense(companyId: string, id: string, dto: CancelExpenseDto): Promise<ExpenseEntity> {
    const expense = await this.getExpense(companyId, id);
    if (expense.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Expense is already cancelled');
    }

    expense.status = TransactionStatus.CANCELLED;
    expense.cancellationReason = dto.reason;
    expense.cancelledAt = new Date();
    const saved = await this.expenseRepo.save(expense);

    await this.outboxService.enqueue(
      companyId,
      EventTopics.EXPENSE_EVENTS,
      DomainEvents.EXPENSE_CANCELLED,
      { companyId, expenseId: id },
    );
    return saved;
  }

  async uploadAttachment(companyId: string, userId: string, expenseId: string, file: any) {
    let storagePath = file.path;
    if (file.buffer) {
      const stored = await this.storageService.uploadFile({
        originalFilename: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        subfolder: 'expenses',
      });
      storagePath = stored.storagePath;
    }

    const attach = this.attachRepo.create({
      companyId,
      referenceId: expenseId,
      referenceType: AttachmentReferenceType.EXPENSE,
      originalFilename: file.originalname,
      storagePath,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: userId,
    });
    return this.attachRepo.save(attach);
  }
}
