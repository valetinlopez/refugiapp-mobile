import { z } from 'zod';

import { animalProfileFields, birthDateBeforeIntakeRefine } from './createAnimalSchema';

export const updateAnimalSchema = z
  .object(animalProfileFields)
  .superRefine(birthDateBeforeIntakeRefine);

export type UpdateAnimalFormInput = z.input<typeof updateAnimalSchema>;
export type UpdateAnimalFormValues = z.output<typeof updateAnimalSchema>;
