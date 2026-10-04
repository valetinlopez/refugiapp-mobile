import type { components } from '@/core/api/generated/openapi';

export type CreateMedicalRecordRequest = Omit<
  components['schemas']['CreateMedicalRecordDto'],
  'diagnosis' | 'treatment' | 'notes'
> & {
  diagnosis?: string;
  treatment?: string;
  notes?: string;
};
export type UpdateMedicalRecordRequest = components['schemas']['UpdateMedicalRecordDto'];
export type MedicalRecordResponse = components['schemas']['MedicalRecordResponseDto'];
export type PaginatedMedicalRecordsResponse =
  components['schemas']['PaginatedMedicalRecordsResponseDto'];
export type VeterinarianResponse = components['schemas']['VeterinarianResponseDto'];
export type PaginatedVeterinariansResponse =
  components['schemas']['PaginatedVeterinariansResponseDto'];
export type PaginatedMediaAssetsResponse = components['schemas']['PaginatedMediaAssetsResponseDto'];
export type MediaAsset = components['schemas']['MediaAssetResponseDto'];
export type MedicalRecordChangeResponse = components['schemas']['MedicalRecordChangeResponseDto'];
export type PaginatedMedicalRecordChangesResponse =
  components['schemas']['PaginatedMedicalRecordChangesResponseDto'];
export type MedicalRecordChangeType = MedicalRecordChangeResponse['changeType'];

export type MedicalRecordType = CreateMedicalRecordRequest['recordType'];

export interface MedicalRecord {
  id: string;
  animalId: string;
  veterinarianId: string | null;
  recordType: MedicalRecordType;
  title: string;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMedicalRecords {
  items: MedicalRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface MedicalRecordFilters {
  recordType?: MedicalRecordType;
  from?: string;
  to?: string;
}

export interface MedicalRecordChange {
  id: string;
  medicalRecordId: string;
  changedByUserId: string | null;
  changeType: MedicalRecordChangeType;
  changedFields: string[];
  previousValues: Record<string, unknown>;
  changedAt: string;
}

export interface PaginatedMedicalRecordChanges {
  items: MedicalRecordChange[];
  page: number;
  limit: number;
  total: number;
}

export interface MedicalRecordChangeFilters {
  changeType?: MedicalRecordChangeType;
  changedByUserId?: string;
  from?: string;
  to?: string;
}

export interface VeterinarianOption {
  id: string;
  name: string;
  licenseNumber: string;
}

export type VeterinariansStatus = 'loading' | 'error' | 'empty' | 'ready';

export interface ClinicalAttachment {
  id: string;
  secureUrl: string;
  name: string;
}

export function toMedicalRecord(dto: MedicalRecordResponse): MedicalRecord {
  return {
    id: dto.id,
    animalId: dto.animalId,
    veterinarianId: typeof dto.veterinarianId === 'string' ? dto.veterinarianId : null,
    recordType: dto.recordType,
    title: dto.title,
    diagnosis: typeof dto.diagnosis === 'string' ? dto.diagnosis : null,
    treatment: typeof dto.treatment === 'string' ? dto.treatment : null,
    notes: typeof dto.notes === 'string' ? dto.notes : null,
    occurredAt: dto.occurredAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toPaginatedMedicalRecords(
  dto: PaginatedMedicalRecordsResponse
): PaginatedMedicalRecords {
  return { ...dto, items: dto.items.map(toMedicalRecord) };
}

export function toVeterinarianOption(dto: VeterinarianResponse): VeterinarianOption {
  return {
    id: dto.id,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    licenseNumber: dto.licenseNumber,
  };
}

export function toClinicalAttachment(dto: MediaAsset): ClinicalAttachment {
  const publicId = dto.publicId.split('/').pop() ?? dto.publicId;
  return {
    id: dto.id,
    secureUrl: dto.secureUrl,
    name: publicId !== '' ? publicId : dto.id,
  };
}

export function toMedicalRecordChange(dto: MedicalRecordChangeResponse): MedicalRecordChange {
  return {
    id: dto.id,
    medicalRecordId: dto.medicalRecordId,
    changedByUserId: dto.changedByUserId ?? null,
    changeType: dto.changeType,
    changedFields: dto.changedFields,
    previousValues: dto.previousValues,
    changedAt: dto.changedAt,
  };
}

export function toPaginatedMedicalRecordChanges(
  dto: PaginatedMedicalRecordChangesResponse
): PaginatedMedicalRecordChanges {
  return { ...dto, items: dto.items.map(toMedicalRecordChange) };
}
