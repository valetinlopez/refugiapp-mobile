import type { components } from '@/core/api/generated/openapi';
import type { MediaFile } from '@/core/media';

export type CreateExpenseRequest = components['schemas']['CreateExpenseDto'];
export type ExpenseResponse = components['schemas']['ExpenseResponseDto'];
export type ExpenseCategory = CreateExpenseRequest['category'];
export type ReceiptFile = MediaFile;

export interface AnimalOption {
  id: string;
  name: string;
}
