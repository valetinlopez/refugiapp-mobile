import type { components } from '@/core/api/generated/openapi';
import type { MediaFile } from '@/core/media';

export type CreateExpenseRequest = components['schemas']['CreateExpenseDto'];
export type ExpenseResponse = components['schemas']['ExpenseResponseDto'];
export type PaginatedExpensesResponse = components['schemas']['PaginatedExpensesResponseDto'];
export type ExpenseCategory = CreateExpenseRequest['category'];
export type ReceiptFile = MediaFile;

export interface AnimalOption {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  animalId: string;
  category: ExpenseCategory;
  amountCents: number;
  currency: string;
  description: string;
  ticketMediaId: string | null;
  incurredAt: string;
}

export interface PaginatedExpenses {
  items: Expense[];
  page: number;
  limit: number;
  total: number;
}

export function toExpense(dto: ExpenseResponse): Expense {
  return {
    id: dto.id,
    animalId: dto.animalId,
    category: dto.category,
    amountCents: dto.amountCents,
    currency: dto.currency,
    description: dto.description,
    ticketMediaId: typeof dto.ticketMediaId === 'string' ? dto.ticketMediaId : null,
    incurredAt: dto.incurredAt,
  };
}

export function toPaginatedExpenses(dto: PaginatedExpensesResponse): PaginatedExpenses {
  return { ...dto, items: dto.items.map(toExpense) };
}
