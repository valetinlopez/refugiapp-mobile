import type { components } from '@/core/api/generated/openapi';

export type CreateCareTaskRequest = components['schemas']['CreateCareTaskDto'];
export type UpdateCareTaskRequest = Omit<
  components['schemas']['UpdateCareTaskDto'],
  'description' | 'dueAt'
> & {
  description?: string | null;
  dueAt?: string | null;
};
export type CareTaskResponse = components['schemas']['CareTaskResponseDto'];
export type PaginatedCareTasksResponse = components['schemas']['PaginatedCareTasksResponseDto'];
export type AnimalOptionResponse = components['schemas']['AnimalResponseDto'];
export type PaginatedAnimalOptionsResponse = components['schemas']['PaginatedAnimalsResponseDto'];

export type CareTaskStatus = CareTaskResponse['status'];

export interface CareTask {
  id: string;
  animalId: string;
  title: string;
  description: string | null;
  status: CareTaskStatus;
  dueAt: string | null;
  completedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalOption {
  id: string;
  name: string;
}

export interface CareTaskFilters {
  animalId?: string;
  status?: CareTaskStatus;
}

export interface PaginatedCareTasks {
  items: CareTask[];
  page: number;
  limit: number;
  total: number;
}

export function toCareTask(dto: CareTaskResponse): CareTask {
  return {
    id: dto.id,
    animalId: dto.animalId,
    title: dto.title,
    description: typeof dto.description === 'string' ? dto.description : null,
    status: dto.status,
    dueAt: typeof dto.dueAt === 'string' ? dto.dueAt : null,
    completedAt: typeof dto.completedAt === 'string' ? dto.completedAt : null,
    createdByUserId: typeof dto.createdByUserId === 'string' ? dto.createdByUserId : null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toPaginatedCareTasks(dto: PaginatedCareTasksResponse): PaginatedCareTasks {
  return { ...dto, items: dto.items.map(toCareTask) };
}
