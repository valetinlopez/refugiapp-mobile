import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { MediaUploadStatus } from '@/components/feedback';
import {
  ActorRow,
  AttachmentList,
  EntityCard,
  MetadataRow,
  SegmentedControl,
  TaskRow,
  formatDateMedium,
  type SegmentedControlOption,
} from '@/components/patterns';
import { AppBadge, AppButton, AppCard, AppDivider, AppText } from '@/components/primitives';
import { AnimalHistoryTimelineItem } from '@/features/animals/components/AnimalHistoryTimelineItem';
import { colors, radii, spacing } from '@/theme';
import type { AnimalStatus, BadgeTone } from '@/types/design-system';

import {
  ANIMAL_EVENT_FIXTURES,
  ANIMAL_FIXTURES,
  ATTACHMENT_FIXTURES,
  AUDIT_LOG_FIXTURES,
  CARE_TASK_FIXTURES,
  DESIGN_SYSTEM_NOW,
  EXPENSE_FIXTURES,
  MEDICAL_RECORD_FIXTURES,
  USER_FIXTURES,
  VETERINARIAN_FIXTURES,
} from './fixtures';
import { formatAmountCents } from './format';
import type { ReferenceCase } from './types';

const ANIMAL_STATUS_PRESENTATION: Record<AnimalStatus, { label: string; tone: BadgeTone }> = {
  admitted: { label: 'Ingresado', tone: 'default' },
  under_treatment: { label: 'En tratamiento', tone: 'info' },
  available_for_adoption: { label: 'Disponible para adopción', tone: 'positive' },
  adopted: { label: 'Adoptado', tone: 'positive' },
  deceased: { label: 'Fallecido', tone: 'neutral' },
};

const RECORD_TYPE_LABELS: Record<string, string> = {
  Consultation: 'Consulta',
  Vaccination: 'Vacunación',
  Deworming: 'Desparasitación',
  Surgery: 'Cirugía',
  LabResult: 'Laboratorio',
  Treatment: 'Tratamiento',
  Other: 'Otro',
};

const SEX_PREVIEW_OPTIONS: readonly SegmentedControlOption<PreviewAnimalSex>[] = [
  { id: 'female', label: 'Hembra' },
  { id: 'male', label: 'Macho' },
  { id: 'unknown', label: 'Desconocido' },
];

type PreviewAnimalSex = 'female' | 'male' | 'unknown';

function LoginPreview() {
  return (
    <AppCard style={styles.stack} variant="organic">
      <AppText variant="heading3">Acceso para personal autorizado</AppText>
      <AppText color="textSecondary">
        Ingresá con tu correo institucional para gestionar el refugio.
      </AppText>
      <MetadataRow label="Correo" value="sofia.herrera@refugiapp.test" />
      <MetadataRow label="Contraseña" value="••••••••••••" />
      <AppButton label="Ingresar" />
      <AppText color="positive" variant="label">
        ¿Olvidaste tu contraseña?
      </AppText>
    </AppCard>
  );
}

function MorePreview() {
  const user = USER_FIXTURES[0];
  return (
    <View style={styles.stack}>
      <EntityCard
        badge={{ icon: 'paw', label: 'Veterinarios' }}
        meta="Alta, edición y estado"
        onPress={() => undefined}
        title="Gestión"
      />
      <EntityCard
        badge={{ icon: 'account', label: 'Usuarios' }}
        meta="Solo admin"
        title="Usuarios"
      />
      <EntityCard
        badge={{ icon: 'document', label: 'Auditoría' }}
        meta="Solo admin"
        title="Ver auditoría"
      />
      {user ? (
        <AppCard style={styles.stack} variant="outlined">
          <AppText variant="heading3">Cuenta</AppText>
          <MetadataRow label="Correo" value={user.email} />
          <MetadataRow label="Roles" value={user.roles.join(', ')} />
          <AppButton icon="logout" label="Cerrar sesión" variant="secondary" />
        </AppCard>
      ) : null}
    </View>
  );
}

function ProfilePreview() {
  const user = USER_FIXTURES[0];
  if (!user) return null;
  return (
    <AppCard style={styles.profileCard}>
      <AppText variant="heading3">{`${user.firstName} ${user.lastName}`}</AppText>
      <MetadataRow label="Correo" value={user.email} />
      <MetadataRow label="Roles" value={user.roles.join(', ')} />
      <AppButton label="Cambiar contraseña" variant="secondary" />
    </AppCard>
  );
}

function UserCreatePreview() {
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow label="Nombre" value="Sofía" />
      <MetadataRow label="Apellido" value="Herrera" />
      <MetadataRow label="Correo" value="sofia.herrera@refugiapp.test" />
      <MetadataRow label="Rol" value="veterinarian" />
      <AppText color="danger" role="alert" variant="caption">
        Ese correo ya está registrado.
      </AppText>
      <AppButton label="Crear usuario" />
    </AppCard>
  );
}

function AnimalHistoryPreview() {
  return (
    <View style={styles.stack}>
      {ANIMAL_EVENT_FIXTURES.map((event, index) => (
        <AnimalHistoryTimelineItem
          event={event}
          isFirst={index === 0}
          isLast={index === ANIMAL_EVENT_FIXTURES.length - 1}
          key={event.id}
        />
      ))}
    </View>
  );
}

function AnimalStatusPreview() {
  return (
    <AppCard style={styles.stack} variant="outlined">
      <AppText color="textSecondary" variant="label">
        Estado actual
      </AppText>
      <AppBadge icon="medical" label="En tratamiento" tone="info" />
      <AppText color="textSecondary">
        El cambio de estado es irreversible en la mayoría de los casos y se confirma antes de
        aplicarse.
      </AppText>
      <View style={styles.badgeWrap}>
        {ANIMAL_FIXTURES.map((animal) => {
          const presentation = ANIMAL_STATUS_PRESENTATION[animal.status];
          return (
            <AppBadge
              key={animal.id}
              label={`${animal.name}: ${presentation.label}`}
              tone={presentation.tone}
            />
          );
        })}
      </View>
    </AppCard>
  );
}

function AnimalEditPreview() {
  const [sex, setSex] = useState<PreviewAnimalSex>('female');

  return (
    <AppCard style={styles.stack} variant="elevated">
      <View style={styles.badgeWrap}>
        <View style={styles.dirtyDot} />
        <AppText color="textSecondary" variant="caption">
          Cambios sin guardar
        </AppText>
      </View>
      <MetadataRow label="Nombre" value="Luna" />
      <MetadataRow label="Especie" value="Perra" />
      <MetadataRow label="Raza · modificado" value="Mestiza" />
      <SegmentedControl<PreviewAnimalSex>
        accessibilityLabel="Sexo"
        onChange={setSex}
        options={SEX_PREVIEW_OPTIONS}
        value={sex}
      />
      <MetadataRow label="Ingreso" value={formatDateMedium('2026-08-15')} />
      <MetadataRow label="Nacimiento" value={formatDateMedium('2023-04-10')} />
      <AppText color="textSecondary" variant="caption">
        La fecha de nacimiento debe ser anterior o igual a la fecha de ingreso.
      </AppText>
      <View style={styles.actionRow}>
        <AppButton label="Descartar" variant="secondary" />
        <AppButton label="Guardar cambios" />
      </View>
    </AppCard>
  );
}

function AnimalEventPreview() {
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow label="Título" value="Control general" />
      <MetadataRow label="Fecha" value={formatDateMedium('2026-09-20')} />
      <MetadataRow label="Detalle" value="Evolución favorable." />
      <AppButton label="Agregar evento" />
    </AppCard>
  );
}

function AnimalFilesPreview() {
  return (
    <View style={styles.stack}>
      <AttachmentList attachments={ATTACHMENT_FIXTURES} onRetry={() => undefined} />
      <MediaUploadStatus fileName="estudio-completo.pdf" progress={0.6} status="uploading" />
    </View>
  );
}

type CareFilter = 'all' | 'pending' | 'completed';

const careFilterOptions: readonly SegmentedControlOption<CareFilter>[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', icon: 'clock', label: 'Pendientes' },
  { id: 'completed', icon: 'check', label: 'Completadas' },
];

function CareOverviewPreview() {
  const [filter, setFilter] = useState<CareFilter>('all');
  const tasks = CARE_TASK_FIXTURES.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.status === 'completed';
    return task.status === 'pending';
  });

  return (
    <View style={styles.stack}>
      <SegmentedControl
        accessibilityLabel="Filtrar tareas por estado"
        onChange={(value) => setFilter(value)}
        options={careFilterOptions}
        value={filter}
      />
      <AppCard>
        {tasks.map((task, index) => (
          <View key={task.id}>
            {index > 0 ? <AppDivider /> : null}
            <TaskRow
              animalName={task.animalName}
              assignee={task.assignee}
              dueAt={new Date(task.dueAt)}
              isClinical={task.isClinical}
              now={DESIGN_SYSTEM_NOW}
              status={task.status}
              timeLabel={task.timeLabel}
              title={task.title}
            />
          </View>
        ))}
      </AppCard>
    </View>
  );
}

function CareNewPreview() {
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow label="Título" value="Administrar antibiótico" />
      <MetadataRow label="Animal" value="Luna" />
      <MetadataRow label="Vencimiento" value={formatDateMedium('2026-09-21')} />
      <AppText color="textSecondary" variant="caption">
        El backend registra automáticamente a la persona que crea la tarea.
      </AppText>
      <AppButton label="Crear tarea" />
    </AppCard>
  );
}

function CareDetailPreview() {
  const task = CARE_TASK_FIXTURES[0];
  if (!task) return null;
  return (
    <View style={styles.stack}>
      <AppCard>
        <TaskRow
          animalName={task.animalName}
          assignee={task.assignee}
          dueAt={new Date(task.dueAt)}
          isClinical={task.isClinical}
          now={DESIGN_SYSTEM_NOW}
          status={task.status}
          timeLabel={task.timeLabel}
          title={task.title}
        />
      </AppCard>
      <View style={styles.actionRow}>
        <AppButton icon="check" label="Completar" />
        <AppButton icon="close" label="Cancelar" variant="danger" />
      </View>
    </View>
  );
}

function ExpensesOverviewPreview() {
  const subtotal = EXPENSE_FIXTURES.reduce((total, expense) => total + expense.amountCents, 0);
  return (
    <View style={styles.stack}>
      <AppText color="textSecondary" variant="caption">
        {`Subtotal cargado: ${formatAmountCents(subtotal)}`}
      </AppText>
      {EXPENSE_FIXTURES.map((expense) => (
        <EntityCard
          badge={{ icon: 'money', label: formatAmountCents(expense.amountCents), tone: 'info' }}
          key={expense.id}
          meta={`${expense.category} · ${formatDateMedium(expense.incurredAt)}`}
          onPress={() => undefined}
          title={expense.description}
        />
      ))}
    </View>
  );
}

function ExpenseNewPreview() {
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow label="Animal" value="Luna" />
      <MetadataRow label="Categoría" value="Alimentación" />
      <MetadataRow label="Importe" value={formatAmountCents(1850000)} />
      <MetadataRow label="Fecha" value={formatDateMedium('2026-09-18')} />
      <MetadataRow label="Comprobante" value="ticket-alimento.jpg" />
      <AppButton icon="money" label="Registrar gasto" />
    </AppCard>
  );
}

function ExpenseDetailPreview() {
  const expense = EXPENSE_FIXTURES[0];
  if (!expense) return null;
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow label="Descripción" value={expense.description} />
      <MetadataRow label="Animal" value={expense.animalName} />
      <MetadataRow label="Categoría" value={expense.category} />
      <MetadataRow label="Importe" value={formatAmountCents(expense.amountCents)} />
      <MetadataRow label="Fecha" value={formatDateMedium(expense.incurredAt)} />
    </AppCard>
  );
}

function ClinicalHistoryPreview() {
  return (
    <View style={styles.stack}>
      {MEDICAL_RECORD_FIXTURES.map((record) => (
        <EntityCard
          badge={{
            icon: 'medical',
            label: RECORD_TYPE_LABELS[record.recordType] ?? record.recordType,
            tone: 'info',
          }}
          key={record.id}
          meta={`${record.animalName} · ${formatDateMedium(record.occurredAt)}`}
          onPress={() => undefined}
          title={record.diagnosis}
        />
      ))}
    </View>
  );
}

function ClinicalNewPreview() {
  const record = MEDICAL_RECORD_FIXTURES[0];
  if (!record) return null;
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow
        label="Tipo"
        value={RECORD_TYPE_LABELS[record.recordType] ?? record.recordType}
      />
      <MetadataRow label="Veterinario" value={record.veterinarianName} />
      <MetadataRow label="Fecha" value={formatDateMedium(record.occurredAt)} />
      <AppText color="textSecondary" variant="caption">
        El veterinario debe estar activo para poder guardar.
      </AppText>
      <AppButton label="Guardar registro" />
    </AppCard>
  );
}

function ClinicalDetailPreview() {
  const record = MEDICAL_RECORD_FIXTURES[0];
  if (!record) return null;
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow label="Diagnóstico" value={record.diagnosis} />
      <MetadataRow label="Tratamiento" value={record.treatment} />
      <AppDivider />
      <ActorRow
        accessibilityLabel="Cambio realizado por E2E Admin"
        caption="admin.e2e@refugiapp.test"
        initials="EA"
        name="E2E Admin"
        occurredAt="2026-09-19T14:30:00-03:00"
      />
    </AppCard>
  );
}

function VetsListPreview() {
  return (
    <View style={styles.stack}>
      {VETERINARIAN_FIXTURES.map((vet) => (
        <EntityCard
          avatar={{ accessibilityLabel: `Avatar de ${vet.fullName}`, initials: 'SH' }}
          badge={{
            icon: vet.isActive ? 'check' : 'close',
            label: vet.isActive ? 'Activo' : 'Inactivo',
            tone: vet.isActive ? 'positive' : 'neutral',
          }}
          key={vet.id}
          meta={vet.licenseNumber}
          onPress={() => undefined}
          title={vet.fullName}
        />
      ))}
    </View>
  );
}

function VetNewPreview() {
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow label="Nombre" value="Dra. Sofía Herrera" />
      <MetadataRow label="Matrícula" value="MN 12.345" />
      <MetadataRow label="Correo" value="sofia.herrera@refugiapp.test" />
      <MetadataRow label="Contraseña inicial" value="••••••••••••" />
      <AppButton label="Crear veterinario" />
    </AppCard>
  );
}

function VetProfilePreview() {
  const vet = VETERINARIAN_FIXTURES[0];
  if (!vet) return null;
  return (
    <View style={styles.stack}>
      <EntityCard
        avatar={{ accessibilityLabel: `Avatar de ${vet.fullName}`, initials: 'SH' }}
        badge={{ icon: 'check', label: 'Activo', tone: 'positive' }}
        meta={vet.email}
        title={vet.fullName}
      />
      <AppCard style={styles.stack} variant="outlined">
        <MetadataRow label="Matrícula" value={vet.licenseNumber} />
        <MetadataRow label="Teléfono" value={vet.phone} />
        <AppButton label="Desactivar" variant="danger" />
      </AppCard>
    </View>
  );
}

function AuditListPreview() {
  const log = AUDIT_LOG_FIXTURES[0];
  if (!log) return null;
  return (
    <View style={styles.stack}>
      <View style={styles.badgeWrap}>
        <AppBadge icon="document" label={log.actionLabel} tone="info" />
        <AppBadge label={log.resourceType} />
      </View>
      <AppCard>
        <ActorRow
          accessibilityLabel={`Acción de ${log.actorName}`}
          initials="EA"
          name={log.actorName}
          occurredAt={log.createdAt}
        />
        <AppDivider />
        <AppText color="textSecondary">{log.summary}</AppText>
      </AppCard>
    </View>
  );
}

function AuditDetailPreview() {
  const log = AUDIT_LOG_FIXTURES[0];
  if (!log) return null;
  return (
    <AppCard style={styles.stack} variant="outlined">
      <MetadataRow label="Acción" value={log.actionLabel} />
      <MetadataRow label="Recurso" value={log.resourceType} />
      <MetadataRow label="Fecha" value={formatDateMedium(log.createdAt)} />
      <AppDivider />
      <ActorRow
        accessibilityLabel={`Detalle de ${log.actorName}`}
        caption={log.actorEmail}
        initials="EA"
        name={log.actorName}
        occurredAt={log.createdAt}
      />
    </AppCard>
  );
}

function DashboardHomePreview() {
  const pending = CARE_TASK_FIXTURES.filter((task) => task.status === 'pending');
  return (
    <View style={styles.stack}>
      <AppText variant="heading3">Buenas tardes, Andrés</AppText>
      <AppText color="textSecondary" variant="caption">
        Hoy, 20 de septiembre
      </AppText>
      <AppCard style={styles.stack} variant="organic">
        <View style={styles.badgeWrap}>
          <AppBadge icon="paw" label="Animales: 48" />
          <AppBadge icon="medical" label="En tratamiento: 9" tone="info" />
          <AppBadge icon="calendar" label="Cuidados pendientes: 6" tone="warning" />
        </View>
      </AppCard>
      <AppCard style={styles.stack}>
        <AppText variant="label">Prioridades de hoy</AppText>
        {pending.map((task) => (
          <TaskRow
            animalName={task.animalName}
            assignee={task.assignee}
            dueAt={new Date(task.dueAt)}
            isClinical={task.isClinical}
            key={task.id}
            now={DESIGN_SYSTEM_NOW}
            status={task.status}
            timeLabel={task.timeLabel}
            title={task.title}
          />
        ))}
      </AppCard>
    </View>
  );
}

function AnimalsListPreview() {
  return (
    <View style={styles.stack}>
      {ANIMAL_FIXTURES.map((animal) => {
        const presentation = ANIMAL_STATUS_PRESENTATION[animal.status];
        return (
          <EntityCard
            avatar={{ accessibilityLabel: `Foto de ${animal.name}`, initials: animal.name }}
            badge={{ icon: 'paw', label: presentation.label, tone: presentation.tone }}
            key={animal.id}
            meta={`${animal.species} · ${animal.breed}`}
            onPress={() => undefined}
            title={animal.name}
          />
        );
      })}
    </View>
  );
}

const PREVIEWS: Partial<Record<ReferenceCase['id'], () => ReactNode>> = {
  'D06-01': LoginPreview,
  'D06-02': MorePreview,
  'D06-03': ProfilePreview,
  'D06-04': UserCreatePreview,
  'D06-05': AnimalHistoryPreview,
  'D06-06': AnimalStatusPreview,
  'D06-07': AnimalEditPreview,
  'D06-08': AnimalEventPreview,
  'D06-09': AnimalFilesPreview,
  'D06-10': CareOverviewPreview,
  'D06-11': CareNewPreview,
  'D06-12': CareDetailPreview,
  'D06-13': ExpensesOverviewPreview,
  'D06-14': ExpenseNewPreview,
  'D06-15': ExpenseDetailPreview,
  'D06-16': ClinicalHistoryPreview,
  'D06-17': ClinicalNewPreview,
  'D06-18': ClinicalDetailPreview,
  'D06-19': VetsListPreview,
  'D06-20': VetNewPreview,
  'D06-21': VetProfilePreview,
  'D06-22': AuditListPreview,
  'D06-23': AuditDetailPreview,
  'D06-24': DashboardHomePreview,
  'D06-25': AnimalsListPreview,
};

/**
 * Renders the reproducible case of a reference (D06 / RFG-139).
 *
 * Each preview composes the shared patterns with deterministic fixtures so the
 * catalog and `RFG-167` can compare the same structure without network, real
 * data or external services. `FIXTURE_UUIDS.media` and the other fixed ids keep
 * the cases stable across runs.
 */
export function ReferencePreview({ referenceCase }: { referenceCase: ReferenceCase }) {
  const Preview = PREVIEWS[referenceCase.id];
  if (!Preview) return null;
  return (
    <View style={styles.preview} testID={`ds-case-preview-${referenceCase.id}`}>
      <Preview />
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dirtyDot: {
    alignSelf: 'center',
    backgroundColor: colors.positive,
    borderRadius: radii.full,
    height: spacing.xs,
    width: spacing.xs,
  },
  preview: {
    borderColor: colors.divider,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  profileCard: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
  },
});
