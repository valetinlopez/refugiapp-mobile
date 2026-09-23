export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  animals: [...['expenses'], 'animal-options'] as const,
};

export const dashboardQueryKey = ['dashboard'] as const;
