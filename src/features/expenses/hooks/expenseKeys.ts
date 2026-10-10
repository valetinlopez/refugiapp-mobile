import type { ExpenseFilters } from '../types';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...expenseKeys.lists(), 'global', filters] as const,
  infiniteList: (filters: ExpenseFilters) => [...expenseKeys.lists(), 'infinite', filters] as const,
  listByAnimal: (animalId: string) => [...expenseKeys.lists(), 'animal', animalId] as const,
  detail: (id: string) => [...expenseKeys.all, 'detail', id] as const,
  media: (mediaId: string) => [...expenseKeys.all, 'media', mediaId] as const,
};

export const dashboardQueryKey = ['dashboard'] as const;

/** Value-compatible prefix of `src/application/home`, invalidated by value to avoid cross-feature imports. */
export const homeQueryKey = ['home'] as const;
