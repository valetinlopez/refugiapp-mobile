import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adoptionsApi } from '../api/adoptionsApi';
import type { Adoption, AdoptionApplication, CreateAdopterRequest } from '../types';
import { CreateApplicationError } from '../utils/adoptionErrorMessages';
import { adoptionKeys } from './adoptionKeys';

interface CreateApplicationInput {
  adopter?: CreateAdopterRequest;
  existingAdopterId?: string;
}

export function useCreateAdoptionApplication(animalId: string) {
  const queryClient = useQueryClient();

  return useMutation<AdoptionApplication, Error, CreateApplicationInput>({
    mutationFn: async ({ adopter, existingAdopterId }) => {
      let adopterId = existingAdopterId;
      if (adopterId === undefined) {
        if (adopter === undefined) {
          throw new Error('Adopter data is required');
        }
        const created = await adoptionsApi.createAdopter(adopter);
        adopterId = created.id;
        queryClient.setQueryData(adoptionKeys.adopter(created.id), created);
      }

      try {
        return await adoptionsApi.createApplication(animalId, { adopterId });
      } catch (error) {
        throw new CreateApplicationError(error, adopterId);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adoptionKeys.applications(animalId) });
    },
  });
}

export function useApproveAdoption(animalId: string) {
  const queryClient = useQueryClient();

  return useMutation<Adoption, Error, string>({
    mutationFn: (applicationId) => adoptionsApi.approveApplication(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adoptionKeys.animal(animalId) });
    },
  });
}
