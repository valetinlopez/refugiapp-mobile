import type { CreateAnimalInput } from '../hooks/useCreateAnimal';

import { AnimalProfileForm } from './AnimalProfileForm';

interface AnimalCreateFormProps {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onCancelUpload?(): void;
  onSubmit(input: CreateAnimalInput): void;
  upload?: { fileName: string; progress: number } | null;
}

export function AnimalCreateForm(props: AnimalCreateFormProps) {
  return <AnimalProfileForm mode="create" {...props} />;
}
