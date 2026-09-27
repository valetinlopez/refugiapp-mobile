import type { components } from '@/core/api/generated/openapi';

export type DashboardOverviewResponse = components['schemas']['DashboardOverviewResponseDto'];
export type DashboardTotalsResponse = components['schemas']['DashboardTotalsDto'];
export type DashboardAnimalResponse = components['schemas']['DashboardAnimalDto'];
export type MediaAssetResponse = components['schemas']['MediaAssetResponseDto'];

export type DashboardAnimalStatus = NonNullable<DashboardAnimalResponse['status']>;

export interface DashboardAnimal {
  id: string;
  name: string;
  species: string;
  status: DashboardAnimalStatus;
  profilePhotoMediaId: string | null;
}

export interface DashboardTotals {
  animals: number;
  byStatus: Record<DashboardAnimalStatus, number>;
}

export interface DashboardOverview {
  totals: DashboardTotals;
  recentAnimals: DashboardAnimal[];
}

export const DASHBOARD_STATUS_ORDER: readonly DashboardAnimalStatus[] = [
  'admitted',
  'under_treatment',
  'available_for_adoption',
  'adopted',
  'deceased',
];

function toDashboardAnimal(dto: DashboardAnimalResponse): DashboardAnimal {
  return {
    id: dto.id,
    name: dto.name,
    species: dto.species,
    status: dto.status,
    profilePhotoMediaId:
      typeof dto.profilePhotoMediaId === 'string' ? dto.profilePhotoMediaId : null,
  };
}

function toByStatus(
  dto: DashboardTotalsResponse['byStatus']
): Record<DashboardAnimalStatus, number> {
  const byStatus = {} as Record<DashboardAnimalStatus, number>;
  for (const status of DASHBOARD_STATUS_ORDER) {
    const value = dto[status];
    byStatus[status] = typeof value === 'number' ? value : 0;
  }
  return byStatus;
}

export function toDashboardOverview(dto: DashboardOverviewResponse): DashboardOverview {
  return {
    totals: {
      animals: dto.totals.animals,
      byStatus: toByStatus(dto.totals.byStatus),
    },
    recentAnimals: dto.recentAnimals.map(toDashboardAnimal),
  };
}
