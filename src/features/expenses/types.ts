import type { components } from '@/core/api/generated/openapi';
import type { MediaFile } from '@/core/media';

export type CreateExpenseRequest = components['schemas']['CreateExpenseDto'];
export type ExpenseResponse = components['schemas']['ExpenseResponseDto'];
export type PaginatedExpensesResponse = components['schemas']['PaginatedExpensesResponseDto'];
export type MediaAssetResponse = components['schemas']['MediaAssetResponseDto'];
export type ExpenseCategory = CreateExpenseRequest['category'];
export type ReceiptFile = MediaFile;

export type { AnimalOption } from '@/application/animals';

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

/**
 * Detail view model for a single expense.
 *
 * Extends the list summary with the audit fields the detail needs. The actor
 * is kept as its raw `createdByUserId` UUID (nullable): the contract publishes
 * no readable name, so the UI resolves it best-effort from the session and
 * never renders a raw UUID.
 */
export interface ExpenseDetail extends Expense {
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
}

/**
 * Receipt view model derived from `GET /media/:id`.
 *
 * `format` and `bytes` are optional in the contract; they are normalized to
 * `null` so the UI can degrade to a generic label without inventing metadata.
 */
export interface ExpenseReceipt {
  id: string;
  secureUrl: string;
  resourceType: MediaAssetResponse['resourceType'];
  format: string | null;
  bytes: number | null;
}

export interface PaginatedExpenses {
  items: Expense[];
  page: number;
  limit: number;
  total: number;
}

export interface ExpenseFilters {
  animalId?: string;
  category?: ExpenseCategory;
  from?: string;
  to?: string;
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

export function toExpenseDetail(dto: ExpenseResponse): ExpenseDetail {
  return {
    ...toExpense(dto),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdByUserId: typeof dto.createdByUserId === 'string' ? dto.createdByUserId : null,
  };
}

export function toExpenseReceipt(dto: MediaAssetResponse): ExpenseReceipt {
  return {
    id: dto.id,
    secureUrl: dto.secureUrl,
    resourceType: dto.resourceType,
    format: typeof dto.format === 'string' && dto.format.length > 0 ? dto.format : null,
    bytes: typeof dto.bytes === 'number' && Number.isFinite(dto.bytes) ? dto.bytes : null,
  };
}

export function toPaginatedExpenses(dto: PaginatedExpensesResponse): PaginatedExpenses {
  return { ...dto, items: dto.items.map(toExpense) };
}
