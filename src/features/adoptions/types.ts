import type { components } from '@/core/api/generated/openapi';

export type CreateAdopterRequest = components['schemas']['CreateAdopterDto'];
export type Adopter = components['schemas']['AdopterResponseDto'];
export type CreateAdoptionApplicationRequest =
  components['schemas']['CreateAdoptionApplicationDto'];
export type AdoptionApplication = components['schemas']['AdoptionApplicationResponseDto'];
export type AdoptionApplicationStatus = AdoptionApplication['status'];
export type PaginatedAdoptionApplications =
  components['schemas']['PaginatedAdoptionApplicationsResponseDto'];
export type ApproveAdoptionRequest = components['schemas']['ApproveAdoptionDto'];
export type Adoption = components['schemas']['AdoptionResponseDto'];
export type PaginatedAdoptions = components['schemas']['PaginatedAdoptionsResponseDto'];
