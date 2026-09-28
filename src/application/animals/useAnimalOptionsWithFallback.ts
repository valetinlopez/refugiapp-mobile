import { isUuid } from '@/core/validation';

import type { AnimalOption } from './animalOptionsApi';
import { toAnimalOptionsErrorMessage } from './toAnimalOptionsErrorMessage';
import { useAnimalOption } from './useAnimalOption';
import { useAnimalOptions } from './useAnimalOptions';

export interface AnimalOptionsState {
  data: AnimalOption[] | undefined;
  errorMessage: string | null;
  isError: boolean;
  isFallback: boolean;
  isPending: boolean;
  refetch: () => Promise<unknown>;
}

export function useAnimalOptionsWithFallback(animalId?: string): AnimalOptionsState {
  const optionsQuery = useAnimalOptions();
  const hasValidAnimalId = animalId !== undefined && isUuid(animalId);
  const list = optionsQuery.data;
  const missingFromList =
    hasValidAnimalId && list !== undefined && !list.some((option) => option.id === animalId);
  const needsFallback =
    hasValidAnimalId && !optionsQuery.isPending && (optionsQuery.isError || missingFromList);
  const fallbackQuery = useAnimalOption(animalId, needsFallback);
  const fallbackOption = needsFallback ? fallbackQuery.data : undefined;

  const data =
    list !== undefined
      ? missingFromList && fallbackOption !== undefined
        ? [...list, fallbackOption]
        : list
      : fallbackOption !== undefined
        ? [fallbackOption]
        : undefined;

  const isError = optionsQuery.isError && (!hasValidAnimalId || fallbackQuery.isError);
  const error =
    hasValidAnimalId && fallbackQuery.error !== null ? fallbackQuery.error : optionsQuery.error;

  return {
    data,
    errorMessage: isError && error !== null ? toAnimalOptionsErrorMessage(error) : null,
    isError,
    isFallback: optionsQuery.isError && fallbackOption !== undefined,
    isPending: optionsQuery.isPending || fallbackQuery.isPending,
    refetch: optionsQuery.refetch,
  };
}
