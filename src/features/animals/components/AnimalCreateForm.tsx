import type { CreateAnimalInput } from '../hooks/useCreateAnimal';

import { AnimalProfileForm } from './AnimalProfileForm';

interface AnimalCreateFormProps {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onSubmit(input: CreateAnimalInput): void;
}

export function AnimalCreateForm(props: AnimalCreateFormProps) {
  return <AnimalProfileForm mode="create" {...props} />;
}
