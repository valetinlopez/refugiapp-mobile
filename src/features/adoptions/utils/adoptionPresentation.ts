import type { AdoptionApplicationStatus } from '../types';

export function getApplicationStatusLabel(status: AdoptionApplicationStatus): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'approved':
      return 'Aprobada';
    case 'rejected':
      return 'Rechazada';
  }
}

export function getApplicationStatusTone(
  status: AdoptionApplicationStatus
): 'info' | 'positive' | 'neutral' {
  switch (status) {
    case 'pending':
      return 'info';
    case 'approved':
      return 'positive';
    case 'rejected':
      return 'neutral';
  }
}
