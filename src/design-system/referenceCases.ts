import type { ReferenceCase, ReferenceGroupId } from './types';

export interface ReferenceGroup {
  id: ReferenceGroupId;
  title: string;
  subtitle: string;
}

/**
 * Grouping of the 23 references for the catalog and the checklist. The order
 * follows the walkthrough defined by D01 (auth → account → management →
 * animal → care → expenses → clinical → veterinarians → audit).
 */
export const REFERENCE_GROUPS: readonly ReferenceGroup[] = [
  {
    id: 'auth-account',
    title: 'Acceso y cuenta (01–04)',
    subtitle: 'Login, Más, perfil y alta de usuario.',
  },
  {
    id: 'animals',
    title: 'Animales (05–09)',
    subtitle: 'Detalle, estado, edición, evento y archivos.',
  },
  { id: 'care', title: 'Cuidados (10–12)', subtitle: 'Listado, alta y detalle de tareas.' },
  { id: 'expenses', title: 'Gastos (13–15)', subtitle: 'Listado, alta y detalle de gastos.' },
  {
    id: 'clinical',
    title: 'Clínica (16–18)',
    subtitle: 'Historia global, nuevo registro y detalle.',
  },
  { id: 'veterinarians', title: 'Veterinarios (19–21)', subtitle: 'Listado, alta y perfil.' },
  { id: 'audit', title: 'Auditoría (22–23)', subtitle: 'Listado y detalle con actor legible.' },
];

/**
 * The 23 reproducible cases (D06 / RFG-139).
 *
 * This is a direct, typed mirror of the D01 traceability matrix in
 * `docs/design-references/README.md §2`. It is deliberately declarative: route,
 * audience, states and divergences match the source of truth and never add
 * invented endpoints, roles or permissions. The unit tests enforce the
 * invariants (23 cases, unique ids and reference files, known enums).
 */
export const REFERENCE_CASES: readonly ReferenceCase[] = [
  {
    id: 'D06-01',
    index: 1,
    referenceFile: '01-login.jpeg',
    route: 'app/(auth)/login.tsx',
    audience: 'Público (sin sesión)',
    states: ['default', 'loading', 'error', 'offline'],
    divergences: [
      { kind: 'implemented', note: 'Rediseño editorial implementado (RFG-137).' },
      {
        kind: 'ux',
        note: 'Hero decorativo oculto a AT, sin texto en bitmap y sin iconos dentro de los inputs.',
      },
      { kind: 'contract', note: 'El backend no expone registro público.' },
    ],
    group: 'auth-account',
  },
  {
    id: 'D06-02',
    index: 2,
    referenceFile: '02-more-section.jpeg',
    route: 'app/(app)/(tabs)/more.tsx',
    audience:
      'Los tres roles; usuario: canManageUsers; auditoría: canReadAudit; veterinarios: lectura',
    states: ['default', 'loading', 'error', 'offline'],
    divergences: [
      {
        kind: 'implemented',
        note: 'Pestaña Más rediseñada con perfil resumido, Aplicación y salida segura (RFG-141).',
      },
      { kind: 'implemented', note: 'Coordinación de gestión extraída (RFG-140).' },
      {
        kind: 'ux',
        note: 'No se inventan accesos aún inexistentes de la referencia; la jerarquía real es Gestión > Aplicación > Notificaciones > Salida.',
      },
    ],
    group: 'auth-account',
  },
  {
    id: 'D06-03',
    index: 3,
    referenceFile: '03-my-profile.jpeg',
    route: 'app/(app)/profile.tsx',
    audience: 'Los tres roles',
    states: ['default'],
    divergences: [
      {
        kind: 'implemented',
        note: 'Mi perfil implementado con identidad, estado, fechas, roles y permisos legibles (RFG-142).',
      },
      { kind: 'ux', note: 'Nunca se muestran UUID crudos.' },
    ],
    group: 'auth-account',
  },
  {
    id: 'D06-04',
    index: 4,
    referenceFile: '04-user-create.jpeg',
    route: 'app/(app)/users/new.tsx',
    audience: 'admin (canManageUsers)',
    states: ['default', 'error'],
    divergences: [
      {
        kind: 'implemented',
        note: 'Alta multirrol, password inicial ≥ 12 y confirmación explícita (RFG-143).',
      },
      { kind: 'contract', note: 'El alta es exclusiva por POST /users.' },
    ],
    group: 'auth-account',
  },
  {
    id: 'D06-05',
    index: 5,
    referenceFile: '05-animal-detail-history.jpeg',
    route: 'app/(app)/animals/[id].tsx (pestaña Historial)',
    audience: 'Los tres roles (lectura)',
    states: ['default', 'loading', 'empty', 'error', 'offline'],
    divergences: [
      {
        kind: 'implemented',
        note: 'Cabecera adaptable y pestañas desplazables compartidas (RFG-145).',
      },
      {
        kind: 'implemented',
        note: 'Timeline filtrable, paginación incremental y estados completos (RFG-146).',
      },
      { kind: 'contract', note: 'Historial paginado de 20 ítems.' },
    ],
    group: 'animals',
  },
  {
    id: 'D06-06',
    index: 6,
    referenceFile: '06-animal-status-change.jpeg',
    route: 'app/(app)/animals/[id].tsx + ConfirmDialog',
    audience: 'admin/shelter_manager (canEditAnimal)',
    states: ['default', 'restricted'],
    divergences: [
      {
        kind: 'implemented',
        note: 'Selector tipo sheet con transiciones válidas y occurredAt opcional (RFG-147).',
      },
      {
        kind: 'contract',
        note: 'Estados fijos del backend y matriz local animalTransitions.',
      },
      { kind: 'ux', note: 'Confirmación destructiva explícita para estados terminales.' },
    ],
    group: 'animals',
  },
  {
    id: 'D06-07',
    index: 7,
    referenceFile: '07-animal-edit.jpeg',
    route: 'app/(app)/animals/[id]/edit.tsx',
    audience: 'admin/shelter_manager (canEditAnimal)',
    states: ['default', 'loading', 'error'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-149).' },
      { kind: 'contract', note: 'PATCH diferencial de la ficha.' },
    ],
    group: 'animals',
  },
  {
    id: 'D06-08',
    index: 8,
    referenceFile: '08-animal-event-new.jpeg',
    route: 'app/(app)/animals/[id]/events/new.tsx',
    audience: 'admin/shelter_manager (canEditAnimal)',
    states: ['default', 'error'],
    divergences: [{ kind: 'pending', note: 'Rediseño (RFG-148).' }],
    group: 'animals',
  },
  {
    id: 'D06-09',
    index: 9,
    referenceFile: '09-animal-files-upload.jpeg',
    route: 'app/(app)/animals/[id]/files.tsx (pendiente)',
    audience: 'admin/shelter_manager según contrato de DELETE /media/:id',
    states: ['default', 'empty', 'error', 'offline'],
    divergences: [
      {
        kind: 'pending',
        note: '"Archivos del animal" (RFG-150); hoy no existe gestión de archivos por animal.',
      },
      { kind: 'ux', note: 'Progreso textual, nunca solo color.' },
    ],
    group: 'animals',
  },
  {
    id: 'D06-10',
    index: 10,
    referenceFile: '10-care-tasks-overview.jpeg',
    route: 'app/(app)/(tabs)/care-tasks.tsx',
    audience: 'Lectura los tres roles; escritura admin/shelter_manager',
    states: ['default', 'loading', 'empty', 'error', 'offline'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-151).' },
      { kind: 'contract', note: 'Sin campo type: no inferir categorías desde el título.' },
    ],
    group: 'care',
  },
  {
    id: 'D06-11',
    index: 11,
    referenceFile: '11-care-task-new.jpeg',
    route: 'app/(app)/care-tasks/new.tsx',
    audience: 'admin/shelter_manager',
    states: ['default', 'loading', 'error'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-152).' },
      {
        kind: 'contract',
        note: 'Sin type ni responsable asignable; el backend registra a createdByUserId.',
      },
    ],
    group: 'care',
  },
  {
    id: 'D06-12',
    index: 12,
    referenceFile: '12-care-task-detail.jpeg',
    route: 'app/(app)/care-tasks/[id]/index.tsx',
    audience: 'Lectura los tres roles; acciones admin/shelter_manager',
    states: ['default', 'loading', 'error', 'restricted'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-153).' },
      { kind: 'ux', note: 'Completar/cancelar con ConfirmDialog.' },
    ],
    group: 'care',
  },
  {
    id: 'D06-13',
    index: 13,
    referenceFile: '13-expenses-overview.jpeg',
    route: 'app/(app)/expenses/index.tsx (pendiente)',
    audience: 'Lectura los tres roles; escritura admin/shelter_manager (canManageExpenses)',
    states: ['default', 'loading', 'empty', 'error', 'offline'],
    divergences: [
      { kind: 'pending', note: 'Listado global (RFG-154).' },
      {
        kind: 'ux',
        note: 'No existe total monetario global; se muestra "Subtotal cargado".',
      },
    ],
    group: 'expenses',
  },
  {
    id: 'D06-14',
    index: 14,
    referenceFile: '14-expense-new.jpeg',
    route: 'app/(app)/expenses/new.tsx',
    audience: 'admin/shelter_manager (canManageExpenses)',
    states: ['default', 'error'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-156).' },
      { kind: 'contract', note: 'Sin edición de gastos.' },
    ],
    group: 'expenses',
  },
  {
    id: 'D06-15',
    index: 15,
    referenceFile: '15-expense-detail.jpeg',
    route: 'app/(app)/expenses/[id].tsx (pendiente)',
    audience: 'Los tres roles (lectura)',
    states: ['default', 'loading', 'error'],
    divergences: [
      { kind: 'pending', note: 'Detalle (RFG-157).' },
      {
        kind: 'contract',
        note: 'Requiere ampliar el snapshot OpenAPI móvil (RFG-155) para detalle y borrado.',
      },
    ],
    group: 'expenses',
  },
  {
    id: 'D06-16',
    index: 16,
    referenceFile: '16-clinical-history-overview.jpeg',
    route: 'app/(app)/animals/[id].tsx (pestaña Evolución clínica) y global (pendiente)',
    audience: 'admin/veterinarian (canReadClinicalRecords)',
    states: ['default', 'loading', 'empty', 'error', 'offline', 'restricted'],
    divergences: [
      { kind: 'pending', note: 'Historia clínica global (RFG-158) y paginación UI.' },
      { kind: 'contract', note: 'shelter_manager recibe 403.' },
    ],
    group: 'clinical',
  },
  {
    id: 'D06-17',
    index: 17,
    referenceFile: '17-medical-record-new.jpeg',
    route: 'app/(app)/animals/[id]/medical-records/new.tsx',
    audience: 'admin/veterinarian (canReadClinicalRecords)',
    states: ['default', 'error'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-159).' },
      {
        kind: 'contract',
        note: 'Veterinario activo obligatorio (VETERINARIAN_INACTIVE).',
      },
    ],
    group: 'clinical',
  },
  {
    id: 'D06-18',
    index: 18,
    referenceFile: '18-medical-record-detail.jpeg',
    route: 'app/(app)/animals/[id]/medical-records/[recordId]/changes.tsx y detalle (pendiente)',
    audience: 'admin/veterinarian (canReadClinicalRecords)',
    states: ['default', 'loading', 'error', 'restricted'],
    divergences: [
      { kind: 'pending', note: 'Detalle dedicado (RFG-160).' },
      { kind: 'contract', note: '/medical-records/:id/changes paginado.' },
    ],
    group: 'clinical',
  },
  {
    id: 'D06-19',
    index: 19,
    referenceFile: '19-veterinarians-list.jpeg',
    route: 'app/(app)/veterinarians/index.tsx',
    audience: 'Lectura los tres roles; gestión admin/shelter_manager (canManageVets)',
    states: ['default', 'loading', 'empty', 'error', 'offline'],
    divergences: [{ kind: 'pending', note: 'Rediseño (RFG-161).' }],
    group: 'veterinarians',
  },
  {
    id: 'D06-20',
    index: 20,
    referenceFile: '20-veterinarian-new.jpeg',
    route: 'app/(app)/veterinarians/new.tsx',
    audience: 'admin/shelter_manager (canManageVets)',
    states: ['default', 'error'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-162).' },
      { kind: 'contract', note: 'Vínculo vía createUser, sin selector de usuario existente.' },
    ],
    group: 'veterinarians',
  },
  {
    id: 'D06-21',
    index: 21,
    referenceFile: '21-veterinarian-profile.jpeg',
    route: 'app/(app)/veterinarians/[id].tsx',
    audience: 'Lectura los tres roles; gestión admin/shelter_manager (canManageVets)',
    states: ['default', 'loading', 'error', 'restricted'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-163).' },
      { kind: 'contract', note: 'Identidad desde user.email, nunca UUID crudo.' },
    ],
    group: 'veterinarians',
  },
  {
    id: 'D06-22',
    index: 22,
    referenceFile: '22-audit-list.jpeg',
    route: 'app/(app)/audit/index.tsx',
    audience: 'Solo admin (canReadAudit)',
    states: ['default', 'loading', 'empty', 'error', 'offline'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-165).' },
      { kind: 'contract', note: 'Actor enriquecido en GET /audit-logs.' },
    ],
    group: 'audit',
  },
  {
    id: 'D06-23',
    index: 23,
    referenceFile: '23-audit-detail.jpeg',
    route: 'app/(app)/audit/[id].tsx',
    audience: 'Solo admin (canReadAudit)',
    states: ['default', 'loading', 'error'],
    divergences: [
      { kind: 'pending', note: 'Rediseño (RFG-166).' },
      { kind: 'contract', note: 'GET /audit-logs/:id; el email del actor solo en el detalle.' },
    ],
    group: 'audit',
  },
];

export function getReferenceCase(id: string): ReferenceCase | undefined {
  return REFERENCE_CASES.find((referenceCase) => referenceCase.id === id);
}

export function referenceCasesByGroup(group: ReferenceGroupId): readonly ReferenceCase[] {
  return REFERENCE_CASES.filter((referenceCase) => referenceCase.group === group);
}
