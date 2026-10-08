import type { components } from '@/core/api/generated/openapi';

import { toDateOnly } from './utils/toDateOnly';

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
export type PaginatedMediaAssetsResponse = components['schemas']['PaginatedMediaAssetsResponseDto'];
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

export interface AnimalFile {
  id: string;
  name: string;
  secureUrl: string;
  /** Images render as optimized thumbnails; any other resource falls back to a glyph. */
  isImage: boolean;
  bytes: number | null;
  format: string | null;
}

export interface PaginatedAnimalFiles {
  items: AnimalFile[];
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
    intakeDate: toDateOnly(dto.intakeDate) ?? '',
    birthDate: toDateOnly(dto.birthDate),
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

function fileNameFromPublicId(publicId: string, format: string | null, isImage: boolean): string {
  const segment = publicId.split('/').pop() ?? '';
  if (segment === '') return publicId;
  if (isImage || format === null) return segment;
  const extension = `.${format.toLowerCase()}`;
  return segment.toLowerCase().endsWith(extension) ? segment : `${segment}${extension}`;
}

export function toAnimalFile(dto: MediaAsset): AnimalFile {
  const format = typeof dto.format === 'string' ? dto.format : null;
  const isImage = dto.resourceType === 'image';
  return {
    id: dto.id,
    name: fileNameFromPublicId(dto.publicId, format, isImage),
    secureUrl: dto.secureUrl,
    isImage,
    bytes: typeof dto.bytes === 'number' ? dto.bytes : null,
    format,
  };
}

export function toPaginatedAnimalFiles(dto: PaginatedMediaAssetsResponse): PaginatedAnimalFiles {
  return { ...dto, items: dto.items.map(toAnimalFile) };
}

/**
 * Flattens the paginated pages, removing duplicate ids and excluding the
 * current profile photo so it never shows up twice in the animal's files.
 */
export function flattenAnimalFilesPages(
  pages: readonly PaginatedAnimalFiles[] | undefined,
  excludedMediaId: string | null = null
): AnimalFile[] {
  const seen = new Set<string>();
  const files: AnimalFile[] = [];

  for (const page of pages ?? []) {
    for (const file of page.items) {
      if (seen.has(file.id)) continue;
      seen.add(file.id);
      if (excludedMediaId !== null && file.id === excludedMediaId) continue;
      files.push(file);
    }
  }

  return files;
}
