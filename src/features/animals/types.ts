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

export type AnimalSex = NonNullable<CreateAnimalRequest['sex']>;
export type AnimalStatus = NonNullable<CreateAnimalRequest['status']>;
export type ManualAnimalHistoryEventType = CreateAnimalHistoryEventRequest['eventType'];

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
