import type { components } from '@/core/api/generated/openapi';

export type CreateAnimalRequest = components['schemas']['CreateAnimalDto'];
export type UpdateAnimalRequest = Omit<
  components['schemas']['UpdateAnimalDto'],
  'profilePhotoMediaId'
> & {
  profilePhotoMediaId?: string | null;
};
export type ChangeAnimalStatusRequest = components['schemas']['ChangeAnimalStatusDto'];
export type AnimalResponse = components['schemas']['AnimalResponseDto'];
export type PaginatedAnimalsResponse = components['schemas']['PaginatedAnimalsResponseDto'];
export type MediaAsset = components['schemas']['MediaAssetResponseDto'];
export type CreateAnimalHistoryEventRequest = components['schemas']['CreateAnimalHistoryEventDto'];
export type AnimalHistoryEventResponse = components['schemas']['AnimalHistoryEventResponseDto'];
export type PaginatedAnimalHistoryEventsResponse =
  components['schemas']['PaginatedAnimalHistoryEventsResponseDto'];

export type AnimalSex = NonNullable<CreateAnimalRequest['sex']>;
export type AnimalStatus = NonNullable<CreateAnimalRequest['status']>;
export type ManualAnimalHistoryEventType = CreateAnimalHistoryEventRequest['eventType'];
export type AnimalHistoryEventType = AnimalHistoryEventResponse['eventType'];

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: AnimalSex;
  status: AnimalStatus;
  intakeDate: string;
  birthDate: string | null;
  profilePhotoMediaId: string | null;
}

export interface AnimalListFilters {
  status?: AnimalStatus;
  species?: string;
  sex?: AnimalSex;
  name?: string;
}

export interface PaginatedAnimals {
  items: Animal[];
  page: number;
  limit: number;
  total: number;
}

export interface AnimalHistoryEvent {
  id: string;
  animalId: string;
  eventType: AnimalHistoryEventType;
  description: string;
  occurredAt: string;
  createdByUserId: string | null;
}

export interface PaginatedAnimalHistoryEvents {
  items: AnimalHistoryEvent[];
  page: number;
  limit: number;
  total: number;
}

export function toAnimalView(dto: AnimalResponse): Animal {
  return {
    id: dto.id,
    name: dto.name,
    species: dto.species,
    breed: typeof dto.breed === 'string' ? dto.breed : null,
    sex: dto.sex,
    status: dto.status,
    intakeDate: dto.intakeDate,
    birthDate: typeof dto.birthDate === 'string' ? dto.birthDate : null,
    profilePhotoMediaId:
      typeof dto.profilePhotoMediaId === 'string' ? dto.profilePhotoMediaId : null,
  };
}

export function toPaginatedAnimals(dto: PaginatedAnimalsResponse): PaginatedAnimals {
  return { ...dto, items: dto.items.map(toAnimalView) };
}

export function toAnimalHistoryEvent(dto: AnimalHistoryEventResponse): AnimalHistoryEvent {
  return {
    id: dto.id,
    animalId: dto.animalId,
    eventType: dto.eventType,
    description: dto.description,
    occurredAt: dto.occurredAt,
    createdByUserId: typeof dto.createdByUserId === 'string' ? dto.createdByUserId : null,
  };
}

export function toPaginatedAnimalHistoryEvents(
  dto: PaginatedAnimalHistoryEventsResponse
): PaginatedAnimalHistoryEvents {
  return { ...dto, items: dto.items.map(toAnimalHistoryEvent) };
}
