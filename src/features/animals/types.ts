export type AnimalStatus =
  | 'stray'
  | 'rescued'
  | 'in_treatment'
  | 'available_for_adoption'
  | 'adopted'
  | 'deceased';

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  status: AnimalStatus;
  photoUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnimalRequest {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  status: AnimalStatus;
  photoUrl?: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
