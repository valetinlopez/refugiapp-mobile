export type AnimalStatus =
  'admitted' | 'under_treatment' | 'available_for_adoption' | 'adopted' | 'deceased';

export type CareTaskStatus = 'pending' | 'completed' | 'cancelled';

export type DerivedTaskState = 'overdue' | 'upcoming' | 'clinical';

export type BadgeTone = 'positive' | 'warning' | 'danger' | 'info' | 'neutral' | 'default';

export type UserRole = 'admin' | 'shelter_manager' | 'veterinarian';
