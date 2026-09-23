import type { MedicalRecordFilters } from '../types';

export const medicalRecordKeys = {
  all: ['medical-records'] as const,
  lists: () => [...medicalRecordKeys.all, 'list'] as const,
  listByAnimal: (animalId: string, filters: MedicalRecordFilters) =>
    [...medicalRecordKeys.lists(), 'animal', animalId, filters] as const,
  detail: (id: string) => [...medicalRecordKeys.all, 'detail', id] as const,
  attachments: (recordId: string) =>
    [...medicalRecordKeys.detail(recordId), 'attachments'] as const,
  veterinarianOptions: ['veterinarians', 'options'] as const,
};
