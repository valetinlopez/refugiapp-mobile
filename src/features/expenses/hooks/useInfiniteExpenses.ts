import { useInfiniteQuery } from '@tanstack/react-query';

import { expensesApi } from '../api/expensesApi';
import type { Expense, ExpenseFilters, PaginatedExpenses } from '../types';

import { expenseKeys } from './expenseKeys';

const PAGE_SIZE = 20;

export function useInfiniteExpenses(filters: ExpenseFilters = {}) {
  return useInfiniteQuery({
    queryKey: expenseKeys.infiniteList(filters),
    queryFn: ({ pageParam }) => expensesApi.list(filters, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    retry: 1,
  });
}

/**
 * Flattens paginated expense pages, de-duplicating UUIDs while preserving the
 * backend order (`incurredAt DESC, id DESC`). Overlapping pages can repeat an
 * item at the boundary; the first occurrence wins.
 */
export function flattenExpensePages(pages: readonly PaginatedExpenses[] | undefined): Expense[] {
  const seen = new Set<string>();
  const expenses: Expense[] = [];

  for (const page of pages ?? []) {
    for (const expense of page.items) {
      if (seen.has(expense.id)) continue;
      seen.add(expense.id);
      expenses.push(expense);
    }
  }

  return expenses;
}
