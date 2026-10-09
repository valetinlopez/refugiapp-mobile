import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import type { AnimalOption } from '@/application/animals';
import { EmptyState, ErrorState, LoadingState, MediaUploadStatus } from '@/components/feedback';
import { DateTimeField, SectionHeader } from '@/components/patterns';
import { AppButton, AppCard, AppIcon, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { AttachmentFile } from '../api/clinicalAttachmentsApi';
import type { CreateMedicalRecordInput } from '../hooks/useCreateMedicalRecord';
import type { UpdateMedicalRecordInput } from '../hooks/useUpdateMedicalRecord';
import { useAnimalIntake } from '../hooks/useAnimalIntake';
import type {
  ClinicalAttachment,
  MedicalRecord,
  MedicalRecordType,
  VeterinarianOption,
  VeterinariansStatus,
} from '../types';
import {
  createMedicalRecordSchema,
  type CreateMedicalRecordFormInput,
  MAX_MEDICAL_ATTACHMENTS,
  updateMedicalRecordSchema,
  type UpdateMedicalRecordFormInput,
} from '../utils/medicalRecordSchema';
import {
  toMedicalRecordRecordFields,
  toUpdateMedicalRecordFormValues,
} from '../utils/toMedicalRecordFormValues';
import { RECORD_TYPE_OPTIONS } from '../utils/medicalRecordPresentation';
import { intakeStartOfDay, OCCURRED_AT_FUTURE_TOLERANCE_MS } from '../utils/occurredAtWindow';

import { AnimalRecordField } from './AnimalRecordField';
import { ClinicalAttachmentPicker } from './ClinicalAttachmentPicker';
import { ClinicalRecordTypeField } from './ClinicalRecordTypeField';
import { VeterinarianRecordField } from './VeterinarianRecordField';

const TITLE_MAX_LENGTH = 160;

type CreateProps = {
  animalOptions: AnimalOption[];
  errorMessage?: string | null;
  initialAnimalId?: string | undefined;
  isSubmitting?: boolean;
  onCancel(): void;
  onCancelUpload?(): void;
  onRetryVeterinarians?(): void;
  onSubmit(input: CreateMedicalRecordInput): void;
  upload?: { fileName: string; progress: number } | null;
  veterinarianOptions: VeterinarianOption[];
  veterinariansStatus?: VeterinariansStatus;
};

type EditProps = {
  errorMessage?: string | null;
  existingAttachments: ClinicalAttachment[];
  isSubmitting?: boolean;
  intakeDate: string;
  mode: 'edit';
  onCancelUpload?(): void;
  onRetryVeterinarians?(): void;
  onSubmit(input: UpdateMedicalRecordInput): void;
  record: MedicalRecord;
  upload?: { fileName: string; progress: number } | null;
  veterinarianOptions: VeterinarianOption[];
  veterinariansStatus?: VeterinariansStatus;
};

export type CreateMedicalRecordFormProps = CreateProps & { mode: 'create' };
export type EditMedicalRecordFormProps = EditProps;

export type MedicalRecordFormProps = CreateMedicalRecordFormProps | EditMedicalRecordFormProps;

export function MedicalRecordForm(props: MedicalRecordFormProps) {
  return props.mode === 'create' ? <CreateForm {...props} /> : <EditForm {...props} />;
}

function CreateForm({
  animalOptions,
  errorMessage,
  initialAnimalId,
  isSubmitting = false,
  onCancel,
  onCancelUpload,
  onRetryVeterinarians,
  onSubmit,
  upload,
  veterinarianOptions,
  veterinariansStatus = 'ready',
}: CreateProps & { mode: 'create' }) {
  const [selectedAnimalId, setSelectedAnimalId] = useState(initialAnimalId ?? '');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const intakeQuery = useAnimalIntake(selectedAnimalId);
  const intakeDate = intakeQuery.data ?? '';
  const intakeStart = intakeDate === '' ? null : intakeStartOfDay(intakeDate);
  const { control, handleSubmit, setValue } = useForm<CreateMedicalRecordFormInput>({
    resolver: zodResolver(createMedicalRecordSchema(intakeDate)),
    defaultValues: {
      animalId: initialAnimalId ?? '',
      recordType: 'consultation',
      title: '',
      occurredAt: '',
      veterinarianId: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      attachmentMediaIds: undefined,
    },
    mode: 'onTouched',
  });
  const title = useWatch({ control, name: 'title', defaultValue: '' });

  function selectAnimal(animalId: string): void {
    setSelectedAnimalId(animalId);
    setValue('animalId', animalId, { shouldValidate: true });
    setValue('occurredAt', '', { shouldValidate: false });
  }

  return (
    <View style={styles.form}>
      <AppCard style={styles.card} variant="elevated">
        <SectionHeader subtitle="Datos clínicos mínimos del registro." title="Datos del registro" />
        <Controller
          control={control}
          name="animalId"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Animal *">
              <AnimalRecordField
                animals={animalOptions}
                disabled={isSubmitting}
                onChange={selectAnimal}
                value={field.value}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="veterinarianId"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Veterinario (opcional)">
              <VeterinarianRecordField
                disabled={isSubmitting}
                onChange={field.onChange}
                {...(onRetryVeterinarians ? { onRetry: onRetryVeterinarians } : {})}
                options={veterinarianOptions}
                status={veterinariansStatus}
                value={field.value ?? ''}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="recordType"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Tipo *">
              <ClinicalRecordTypeField
                disabled={isSubmitting}
                onChange={field.onChange}
                value={field.value}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState }) => (
            <Field
              action={
                <AppText color="textSecondary" variant="caption">
                  {String(title.length)}/{TITLE_MAX_LENGTH}
                </AppText>
              }
              error={fieldState.error?.message}
              hint="Entre 3 y 160 caracteres."
              label="Título *"
            >
              <FormInput
                accessibilityLabel="Título"
                autoCapitalize="sentences"
                editable={!isSubmitting}
                maxLength={TITLE_MAX_LENGTH}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Ej. Consulta general"
                returnKeyType="next"
                value={field.value}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="occurredAt"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Fecha y hora *">
              <DateTimeField
                accessibilityLabel="Fecha y hora"
                disabled={isSubmitting}
                maximumDate={new Date(new Date().getTime() + OCCURRED_AT_FUTURE_TOLERANCE_MS)}
                {...(intakeStart ? { minimumDate: intakeStart } : {})}
                mode="datetime"
                onChange={field.onChange}
                value={field.value ?? ''}
              />
              <View style={styles.hint}>
                <AppIcon color="info" name="info" size={16} />
                <AppText color="textSecondary" style={styles.hintText} variant="caption">
                  La fecha no puede ser futura ni anterior al ingreso
                  {intakeDate === '' ? ' del animal.' : ` (${intakeDate}).`}
                </AppText>
              </View>
            </Field>
          )}
        />
      </AppCard>

      <AppCard style={styles.card} variant="elevated">
        <SectionHeader
          subtitle="Opcional. Podés completarlo más tarde."
          title="Información clínica"
        />
        <Controller
          control={control}
          name="diagnosis"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Diagnóstico (opcional)">
              <FormInput
                accessibilityLabel="Diagnóstico"
                autoCapitalize="sentences"
                editable={!isSubmitting}
                multiline
                numberOfLines={3}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Hallazgos (opcional)"
                style={styles.multiline}
                textAlignVertical="top"
                value={field.value ?? ''}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="treatment"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Tratamiento (opcional)">
              <FormInput
                accessibilityLabel="Tratamiento"
                autoCapitalize="sentences"
                editable={!isSubmitting}
                multiline
                numberOfLines={3}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Plan indicado (opcional)"
                style={styles.multiline}
                textAlignVertical="top"
                value={field.value ?? ''}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Notas (opcional)">
              <FormInput
                accessibilityLabel="Notas"
                autoCapitalize="sentences"
                editable={!isSubmitting}
                multiline
                numberOfLines={3}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Observaciones (opcional)"
                style={styles.multiline}
                textAlignVertical="top"
                value={field.value ?? ''}
              />
            </Field>
          )}
        />
      </AppCard>

      <AppCard style={styles.card} variant="elevated">
        <SectionHeader
          action={
            <AppText color="textSecondary" variant="caption">
              {String(attachments.length)} / {MAX_MEDICAL_ATTACHMENTS} archivos
            </AppText>
          }
          subtitle="Imágenes o PDF."
          title="Adjuntos"
        />
        <ClinicalAttachmentPicker
          disabled={isSubmitting}
          onChange={setAttachments}
          onRemoveExisting={() => undefined}
          value={attachments}
        />
      </AppCard>

      {upload ? (
        <MediaUploadStatus
          fileName={upload.fileName}
          {...(onCancelUpload ? { onCancel: onCancelUpload } : {})}
          progress={upload.progress}
          status="uploading"
        />
      ) : null}
      <FormError message={errorMessage} />
      <View style={styles.actions}>
        <AppButton
          disabled={isSubmitting}
          label="Cancelar"
          onPress={onCancel}
          style={styles.actionButton}
          testID="clinical-record-cancel"
          variant="secondary"
        />
        <AppButton
          label="Guardar registro"
          loading={isSubmitting}
          onPress={() =>
            void handleSubmit((raw) => {
              const values = createMedicalRecordSchema(intakeDate).parse(raw);
              onSubmit({ form: values, attachments });
            })()
          }
          style={styles.actionButton}
          testID="clinical-record-submit"
        />
      </View>
    </View>
  );
}

function EditForm({
  errorMessage,
  existingAttachments,
  intakeDate,
  isSubmitting = false,
  onCancelUpload,
  onRetryVeterinarians,
  onSubmit,
  record,
  veterinarianOptions,
  veterinariansStatus = 'ready',
  upload,
}: EditProps) {
  const [newAttachments, setNewAttachments] = useState<AttachmentFile[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const intakeStart = intakeStartOfDay(intakeDate);
  const { control, handleSubmit } = useForm<UpdateMedicalRecordFormInput>({
    resolver: zodResolver(updateMedicalRecordSchema(intakeDate)),
    defaultValues: toUpdateMedicalRecordFormValues(record),
    mode: 'onTouched',
  });

  const visibleExisting = existingAttachments.filter(
    (file) => !removedAttachmentIds.includes(file.id)
  );

  return (
    <View style={styles.form}>
      <RecordFields
        control={control as unknown as Control<RecordFieldsValues>}
        disabled={isSubmitting}
        intakeStart={intakeStart}
        {...(onRetryVeterinarians ? { onRetryVeterinarians } : {})}
        veterinarianOptions={veterinarianOptions}
        veterinariansStatus={veterinariansStatus}
      />
      <View style={styles.field}>
        <AppText variant="label">Adjuntos clínicos</AppText>
        <ClinicalAttachmentPicker
          disabled={isSubmitting}
          existing={visibleExisting}
          onChange={setNewAttachments}
          onRemoveExisting={(id) => setRemovedAttachmentIds((ids) => [...ids, id])}
          value={newAttachments}
        />
      </View>
      {upload ? (
        <MediaUploadStatus
          fileName={upload.fileName}
          {...(onCancelUpload ? { onCancel: onCancelUpload } : {})}
          progress={upload.progress}
          status="uploading"
        />
      ) : null}
      <FormError message={errorMessage} />
      <AppButton
        label="Guardar cambios"
        loading={isSubmitting}
        onPress={() =>
          void handleSubmit((raw) => {
            const values = updateMedicalRecordSchema(intakeDate).parse(raw);
            onSubmit({
              id: record.id,
              initial: toMedicalRecordRecordFields(record),
              form: values,
              newAttachments,
              removedAttachmentIds,
            });
          })()
        }
      />
    </View>
  );
}

interface RecordFieldsValues {
  recordType: MedicalRecordType;
  title: string;
  occurredAt: string;
  veterinarianId?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

function RecordFields({
  control,
  disabled,
  intakeStart,
  onRetryVeterinarians,
  veterinarianOptions,
  veterinariansStatus,
}: {
  control: Control<RecordFieldsValues>;
  disabled: boolean;
  intakeStart: Date | null;
  onRetryVeterinarians?: () => void;
  veterinarianOptions: VeterinarianOption[];
  veterinariansStatus: VeterinariansStatus;
}) {
  return (
    <>
      <Controller
        control={control}
        name="recordType"
        render={({ field, fieldState }) => (
          <OptionGroup
            disabled={disabled}
            error={fieldState.error?.message}
            label="Tipo de registro"
            onChange={field.onChange}
            options={RECORD_TYPE_OPTIONS}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Título">
            <FormInput
              accessibilityLabel="Título"
              autoCapitalize="sentences"
              editable={!disabled}
              maxLength={160}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Ej. Consulta general"
              value={field.value}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="occurredAt"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Fecha y hora">
            <DateTimeField
              accessibilityLabel="Fecha y hora"
              disabled={disabled}
              maximumDate={new Date(new Date().getTime() + OCCURRED_AT_FUTURE_TOLERANCE_MS)}
              {...(intakeStart ? { minimumDate: intakeStart } : {})}
              mode="datetime"
              onChange={field.onChange}
              value={field.value ?? ''}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="veterinarianId"
        render={({ field, fieldState }) => (
          <VeterinarianSelector
            disabled={disabled}
            error={fieldState.error?.message}
            onChange={field.onChange}
            {...(onRetryVeterinarians ? { onRetry: onRetryVeterinarians } : {})}
            options={veterinarianOptions}
            status={veterinariansStatus}
            value={field.value ?? ''}
          />
        )}
      />
      <Controller
        control={control}
        name="diagnosis"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Diagnóstico">
            <FormInput
              accessibilityLabel="Diagnóstico"
              autoCapitalize="sentences"
              editable={!disabled}
              multiline
              numberOfLines={3}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Hallazgos (opcional)"
              style={styles.multiline}
              textAlignVertical="top"
              value={field.value ?? ''}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="treatment"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Tratamiento">
            <FormInput
              accessibilityLabel="Tratamiento"
              autoCapitalize="sentences"
              editable={!disabled}
              multiline
              numberOfLines={3}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Plan indicado (opcional)"
              style={styles.multiline}
              textAlignVertical="top"
              value={field.value ?? ''}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Notas">
            <FormInput
              accessibilityLabel="Notas"
              autoCapitalize="sentences"
              editable={!disabled}
              multiline
              numberOfLines={3}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Observaciones (opcional)"
              style={styles.multiline}
              textAlignVertical="top"
              value={field.value ?? ''}
            />
          </Field>
        )}
      />
    </>
  );
}

function VeterinarianSelector({
  disabled,
  error,
  onChange,
  onRetry,
  options,
  status,
  value,
}: {
  disabled: boolean;
  error: string | undefined;
  onChange(value: string): void;
  onRetry?: () => void;
  options: VeterinarianOption[];
  status: VeterinariansStatus;
  value: string;
}) {
  return (
    <Field error={error} label="Veterinario">
      {status === 'loading' ? <LoadingState label="Cargando veterinarios" /> : null}
      {status === 'error' ? (
        <ErrorState
          actionLabel="Reintentar"
          message="No pudimos cargar los veterinarios. Podés continuar sin veterinario."
          {...(onRetry ? { onAction: onRetry } : {})}
          title="No se pudieron cargar los veterinarios"
        />
      ) : null}
      {status === 'empty' ? (
        <EmptyState
          actionLabel="Reintentar"
          message="No hay veterinarios activos. Podés guardar el registro sin veterinario."
          {...(onRetry ? { onAction: onRetry } : {})}
          title="Sin veterinarios activos"
        />
      ) : null}
      <View accessibilityLabel="Veterinario" accessibilityRole="radiogroup" style={styles.options}>
        <Pressable
          accessibilityLabel="Sin veterinario"
          accessibilityRole="radio"
          accessibilityState={{ disabled, selected: value === '' }}
          disabled={disabled}
          onPress={() => onChange('')}
          style={[styles.option, value === '' && styles.optionSelected]}
        >
          <AppText color={value === '' ? 'textPrimary' : 'textSecondary'} variant="label">
            Sin veterinario
          </AppText>
        </Pressable>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <Pressable
              key={option.id}
              accessibilityLabel={option.name}
              accessibilityRole="radio"
              accessibilityState={{ disabled, selected }}
              disabled={disabled}
              onPress={() => onChange(option.id)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              {selected ? <AppIcon color="positive" name="check" size={sizes.iconSm} /> : null}
              <AppText color={selected ? 'textPrimary' : 'textSecondary'} variant="label">
                {option.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Field>
  );
}

function OptionGroup<T extends string>({
  disabled = false,
  error,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean;
  error: string | undefined;
  label: string;
  onChange(value: T): void;
  options: { label: string; value: T }[];
  value: T | undefined;
}) {
  return (
    <Field error={error} label={label}>
      <View accessibilityLabel={label} accessibilityRole="radiogroup" style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ disabled, selected }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              {selected ? <AppIcon color="positive" name="check" size={sizes.iconSm} /> : null}
              <AppText color={selected ? 'textPrimary' : 'textSecondary'} variant="label">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Field>
  );
}

function Field({
  action,
  children,
  error,
  hint,
  label,
}: {
  action?: ReactNode;
  children: ReactNode;
  error: string | undefined;
  hint?: string;
  label: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <AppText variant="label">{label}</AppText>
        {action}
      </View>
      {children}
      {hint ? (
        <AppText color="textSecondary" variant="caption">
          {hint}
        </AppText>
      ) : null}
      {error ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function FormInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, style]}
      {...props}
    />
  );
}

function FormError({ message }: { message: string | null | undefined }) {
  return message ? (
    <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
      {message}
    </AppText>
  ) : null;
}

const styles = StyleSheet.create({
  actionButton: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { gap: spacing.md },
  field: {
    gap: spacing.xs,
  },
  fieldHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  form: {
    gap: spacing.md,
    width: '100%',
  },
  hint: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xs },
  hintText: { flex: 1, minWidth: 0 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: fontFamilies.body,
    fontSize: 16,
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multiline: {
    minHeight: 96,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  optionSelected: {
    borderColor: colors.positive,
  },
  options: {
    gap: spacing.xs,
  },
});
