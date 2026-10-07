import type { AttachmentItem } from '@/components/patterns';
import type { AnimalHistoryEvent } from '@/features/animals/types';
import type { AnimalStatus, CareTaskStatus, UserRole } from '@/types/design-system';

/**
 * Deterministic fixtures for the visual-validation harness (D06 / RFG-139).
 *
 * Everything here is synthetic and frozen: fixed UUIDs, fixed dates and fixed
 * amounts. No personal data, no real animal data and no network/external
 * service is involved, so cases render identically on every run and in tests.
 * `DESIGN_SYSTEM_NOW` anchors relative task states (`overdue`, `upcoming`) to a
 * single instant instead of the wall clock.
 */
export const DESIGN_SYSTEM_NOW = new Date('2026-09-20T12:00:00-03:00');

export const FIXTURE_UUIDS = {
  animalLuna: '11111111-1111-4111-8111-111111111111',
  animalToby: '22222222-2222-4222-8222-222222222222',
  animalMilo: '33333333-3333-4333-8333-333333333333',
  animalNala: '44444444-4444-4444-8444-444444444444',
  careTaskClinical: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  careTaskOverdue: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  careTaskCompleted: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  expenseFood: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  expenseVet: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  medicalRecord: '99999999-9999-4999-8999-999999999999',
  veterinarian: '12345678-1234-4123-8123-123456789012',
  user: 'abcdefab-cdef-4abc-8def-abcdefabcdef',
  auditLog: 'fedcba98-7654-4321-8987-654321098765',
  media: '00000000-0000-4000-8000-000000000001',
} as const;

export interface AnimalFixture {
  id: string;
  name: string;
  species: string;
  breed: string;
  status: AnimalStatus;
  intakeDate: string;
  birthDate: string;
  profilePhotoMediaId: string | null;
}

export const ANIMAL_FIXTURES: readonly AnimalFixture[] = [
  {
    id: FIXTURE_UUIDS.animalLuna,
    name: 'Luna',
    species: 'Perra',
    breed: 'Mestiza',
    status: 'under_treatment',
    intakeDate: '2026-08-15',
    birthDate: '2023-04-10',
    profilePhotoMediaId: FIXTURE_UUIDS.media,
  },
  {
    id: FIXTURE_UUIDS.animalToby,
    name: 'Toby',
    species: 'Perro',
    breed: 'Labrador',
    status: 'available_for_adoption',
    intakeDate: '2026-07-02',
    birthDate: '2022-11-23',
    profilePhotoMediaId: null,
  },
  {
    id: FIXTURE_UUIDS.animalMilo,
    name: 'Milo',
    species: 'Gato',
    breed: 'Común europeo',
    status: 'admitted',
    intakeDate: '2026-09-20',
    birthDate: '2025-01-05',
    profilePhotoMediaId: null,
  },
  {
    id: FIXTURE_UUIDS.animalNala,
    name: 'Nala',
    species: 'Perra',
    breed: 'Border collie',
    status: 'available_for_adoption',
    intakeDate: '2026-06-11',
    birthDate: '2024-02-18',
    profilePhotoMediaId: null,
  },
];

export interface CareTaskFixture {
  id: string;
  title: string;
  animalName: string;
  /** ISO instant used to derive `overdue`/`upcoming` against `DESIGN_SYSTEM_NOW`. */
  dueAt: string;
  status: CareTaskStatus;
  isClinical: boolean;
  assignee: string;
  timeLabel: string;
}

export const CARE_TASK_FIXTURES: readonly CareTaskFixture[] = [
  {
    id: FIXTURE_UUIDS.careTaskOverdue,
    title: 'Administrar antibiótico',
    animalName: 'Luna',
    dueAt: '2026-09-20T09:30:00-03:00',
    status: 'pending',
    isClinical: true,
    assignee: 'Dra. Sofía',
    timeLabel: '09:30',
  },
  {
    id: FIXTURE_UUIDS.careTaskClinical,
    title: 'Control postoperatorio',
    animalName: 'Milo',
    dueAt: '2026-09-20T17:00:00-03:00',
    status: 'pending',
    isClinical: true,
    assignee: 'Dr. Ramiro',
    timeLabel: '17:00',
  },
  {
    id: FIXTURE_UUIDS.careTaskCompleted,
    title: 'Paseo y socialización',
    animalName: 'Toby',
    dueAt: '2026-09-20T08:00:00-03:00',
    status: 'completed',
    isClinical: false,
    assignee: 'Paula',
    timeLabel: '08:00',
  },
];

export type AnimalEventFixture = AnimalHistoryEvent;

export const ANIMAL_EVENT_FIXTURES: readonly AnimalEventFixture[] = [
  {
    id: '10111111-1111-4111-8111-111111111111',
    animalId: FIXTURE_UUIDS.animalLuna,
    eventType: 'status_change',
    description: 'Ingresado → En tratamiento',
    occurredAt: '2026-09-18T14:20:00-03:00',
    createdByUserId: null,
  },
  {
    id: '20222222-2222-4222-8222-222222222222',
    animalId: FIXTURE_UUIDS.animalLuna,
    eventType: 'behavior_note',
    description: 'Se muestra tranquila y sociable.',
    occurredAt: '2026-09-17T10:35:00-03:00',
    createdByUserId: null,
  },
  {
    id: '30333333-3333-4333-8333-333333333333',
    animalId: FIXTURE_UUIDS.animalLuna,
    eventType: 'transfer',
    description: 'Área de ingreso → Sala tranquila.',
    occurredAt: '2026-09-15T09:10:00-03:00',
    createdByUserId: null,
  },
  {
    id: '40444444-4444-4444-8444-444444444444',
    animalId: FIXTURE_UUIDS.animalLuna,
    eventType: 'intake',
    description: 'Ingreso registrado en el refugio.',
    occurredAt: '2026-09-12T11:30:00-03:00',
    createdByUserId: null,
  },
];

export interface ExpenseFixture {
  id: string;
  animalName: string;
  category: string;
  amountCents: number;
  description: string;
  incurredAt: string;
  hasReceipt: boolean;
}

export const EXPENSE_FIXTURES: readonly ExpenseFixture[] = [
  {
    id: FIXTURE_UUIDS.expenseFood,
    animalName: 'Luna',
    category: 'Alimentación',
    amountCents: 1850000,
    description: 'Bolsa de alimento balanceado 15 kg',
    incurredAt: '2026-09-18',
    hasReceipt: true,
  },
  {
    id: FIXTURE_UUIDS.expenseVet,
    animalName: 'Milo',
    category: 'Veterinaria',
    amountCents: 4250050,
    description: 'Consulta y radiografía de control',
    incurredAt: '2026-09-19',
    hasReceipt: false,
  },
];

export interface MedicalRecordFixture {
  id: string;
  animalName: string;
  recordType: string;
  diagnosis: string;
  treatment: string;
  occurredAt: string;
  veterinarianName: string;
}

export const MEDICAL_RECORD_FIXTURES: readonly MedicalRecordFixture[] = [
  {
    id: FIXTURE_UUIDS.medicalRecord,
    animalName: 'Luna',
    recordType: 'Consultation',
    diagnosis: 'Dermatitis leve',
    treatment: 'Antibiótico oral por 7 días',
    occurredAt: '2026-09-19T10:15:00-03:00',
    veterinarianName: 'Dra. Sofía',
  },
];

export interface VeterinarianFixture {
  id: string;
  fullName: string;
  licenseNumber: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export const VETERINARIAN_FIXTURES: readonly VeterinarianFixture[] = [
  {
    id: FIXTURE_UUIDS.veterinarian,
    fullName: 'Dra. Sofía Herrera',
    licenseNumber: 'MN 12.345',
    email: 'sofia.herrera@refugiapp.test',
    phone: '+54 11 5555-0101',
    isActive: true,
  },
];

export interface AuditLogFixture {
  id: string;
  action: string;
  actionLabel: string;
  resourceType: string;
  actorName: string;
  actorEmail: string;
  createdAt: string;
  summary: string;
}

export const AUDIT_LOG_FIXTURES: readonly AuditLogFixture[] = [
  {
    id: FIXTURE_UUIDS.auditLog,
    action: 'user.create',
    actionLabel: 'Usuario creado',
    resourceType: 'User',
    actorName: 'E2E Admin',
    actorEmail: 'admin.e2e@refugiapp.test',
    createdAt: '2026-09-19T14:30:00-03:00',
    summary: 'Se creó la cuenta de la Dra. Sofía Herrera con rol veterinarian.',
  },
];

export interface UserFixture {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: readonly UserRole[];
  isActive: boolean;
}

export const USER_FIXTURES: readonly UserFixture[] = [
  {
    id: FIXTURE_UUIDS.user,
    firstName: 'Sofía',
    lastName: 'Herrera',
    email: 'sofia.herrera@refugiapp.test',
    roles: ['veterinarian'],
    isActive: true,
  },
];

export const ATTACHMENT_FIXTURES: readonly AttachmentItem[] = [
  { id: 'fixture-ready', name: 'radiografia-torax.jpg', sizeLabel: '1,2 MB', status: 'ready' },
  {
    id: 'fixture-uploading',
    name: 'informe-laboratorio.pdf',
    progress: 0.45,
    sizeLabel: '840 KB',
    status: 'uploading',
  },
  {
    errorMessage: 'No pudimos subir el archivo.',
    id: 'fixture-error',
    name: 'receta-digital.pdf',
    status: 'error',
  },
];
