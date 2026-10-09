import type { ExpenseResponse, MediaAssetResponse } from './types';
import { toExpenseDetail, toExpenseReceipt } from './types';

const EXPENSE_ID = '5fa85f64-5717-4562-b3fc-2c963f66afa6';
const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

function expenseResponse(overrides: Partial<ExpenseResponse> = {}): ExpenseResponse {
  return {
    id: EXPENSE_ID,
    animalId: ANIMAL_ID,
    category: 'veterinary',
    amountCents: 125050,
    currency: 'ARS',
    description: 'Consulta de control',
    ticketMediaId: EXPENSE_ID,
    createdByUserId: EXPENSE_ID,
    incurredAt: '2026-09-20T10:00:00.000Z',
    createdAt: '2026-09-20T10:05:00.000Z',
    updatedAt: '2026-09-20T10:05:00.000Z',
    ...overrides,
  };
}

describe('toExpenseDetail', () => {
  it('keeps integer cents and maps the detail audit fields', () => {
    const detail = toExpenseDetail(expenseResponse());

    expect(detail.amountCents).toBe(125050);
    expect(detail.createdAt).toBe('2026-09-20T10:05:00.000Z');
    expect(detail.createdByUserId).toBe(EXPENSE_ID);
  });

  it('normalizes absent optional values without inventing data', () => {
    const detail = toExpenseDetail(expenseResponse({ ticketMediaId: null, createdByUserId: null }));

    expect(detail.ticketMediaId).toBeNull();
    expect(detail.createdByUserId).toBeNull();
  });
});

describe('toExpenseReceipt', () => {
  function media(overrides: Partial<MediaAssetResponse> = {}): MediaAssetResponse {
    return {
      id: 'media-1',
      resourceType: 'raw',
      publicId: 'demo/ticket',
      secureUrl: 'https://res.cloudinary.com/demo/raw/upload/ticket.pdf',
      format: 'pdf',
      bytes: 1_258_291,
      ...overrides,
    };
  }

  it('maps the media DTO to the receipt view model', () => {
    expect(toExpenseReceipt(media())).toEqual({
      id: 'media-1',
      secureUrl: 'https://res.cloudinary.com/demo/raw/upload/ticket.pdf',
      resourceType: 'raw',
      format: 'pdf',
      bytes: 1_258_291,
    });
  });

  it('normalizes missing format and bytes to null', () => {
    const receipt = toExpenseReceipt({
      id: 'media-2',
      resourceType: 'image',
      publicId: 'demo/photo',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
    });

    expect(receipt.format).toBeNull();
    expect(receipt.bytes).toBeNull();
  });
});
