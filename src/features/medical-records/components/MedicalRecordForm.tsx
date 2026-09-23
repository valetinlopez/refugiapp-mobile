import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { MediaUploadStatus } from '@/components/feedback';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { AttachmentFile } from '../api/clinicalAttachmentsApi';
import type { CreateMedicalRecordInput } from '../hooks/useCreateMedicalRecord';
import type { UpdateMedicalRecordInput } from '../hooks/useUpdateMedicalRecord';
import type {
  ClinicalAttachment,
  MedicalRecord,
  MedicalRecordType,
  VeterinarianOption,
} from '../types';
import {
  createMedicalRecordSchema,
  type CreateMedicalRecordFormInput,
  MEDICAL_RECORD_TYPE_VALUES,
  updateMedicalRecordSchema,
  type UpdateMedicalRecordFormInput,
} from '../utils/medicalRecordSchema';
import {
  toMedicalRecordRecordFields,
  toUpdateMedicalRecordFormValues,
} from '../utils/toMedicalRecordFormValues';
import {
  formatRecordDate,
  getRecordTypeLabel,
  toLocalDateTimeIso,
} from '../utils/medicalRecordPresentation';

import { ClinicalAttachmentPicker } from './ClinicalAttachmentPicker';

export const RECORD_TYPE_OPTIONS: { label: string; value: MedicalRecordType }[] =
  MEDICAL_RECORD_TYPE_VALUES.map((value) => ({
    label: getRecordTypeLabel(value),
    value,
  }));

interface BaseProps {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  intakeDate: string;
  onCancelUpload?(): void;
  upload?: { fileName: string; progress: number } | null;
  veterinarianOptions: VeterinarianOption[];
}

type CreateProps = BaseProps & {
  animalId: string;
  mode: 'create';
  onSubmit(input: CreateMedicalRecordInput): void;
};

type EditProps = BaseProps & {
  existingAttachments: ClinicalAttachment[];
  mode: 'edit';
  onSubmit(input: UpdateMedicalRecordInput): void;
  record: MedicalRecord;
};

export type MedicalRecordFormProps = CreateProps | EditProps;

export function MedicalRecordForm(props: MedicalRecordFormProps) {
  return props.mode === 'create' ? <CreateForm {...props} /> : <EditForm {...props} />;
}

function CreateForm({
  animalId,
  errorMessage,
  intakeDate,
  isSubmitting = false,
  onCancelUpload,
  onSubmit,
  upload,
  veterinarianOptions,
}: CreateProps) {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const { control, handleSubmit } = useForm<CreateMedicalRecordFormInput>({
    resolver: zodResolver(createMedicalRecordSchema(intakeDate)),
    defaultValues: {
      animalId,
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

  return (
    <View style={styles.form}>
      <RecordFields
        control={control as unknown as Control<RecordFieldsValues>}
        disabled={isSubmitting}
        veterinarianOptions={veterinarianOptions}
      />
      <View style={styles.field}>
        <AppText variant="label">Adjuntos clínicos</AppText>
        <ClinicalAttachmentPicker
          disabled={isSubmitting}
          onChange={setAttachments}
          onRemoveExisting={() => undefined}
          value={attachments}
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
        label="Registrar consulta"
        loading={isSubmitting}
        onPress={() =>
          void handleSubmit((raw) => {
            const values = createMedicalRecordSchema(intakeDate).parse(raw);
            onSubmit({ form: values, attachments });
          })()
        }
      />
    </View>
  );
}

function EditForm({
  errorMessage,
  existingAttachments,
  intakeDate,
  isSubmitting = false,
  onCancelUpload,
  onSubmit,
  record,
  veterinarianOptions,
  upload,
}: EditProps) {
  const [newAttachments, setNewAttachments] = useState<AttachmentFile[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
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
        veterinarianOptions={veterinarianOptions}
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
  veterinarianOptions,
}: {
  control: Control<RecordFieldsValues>;
  disabled: boolean;
  veterinarianOptions: VeterinarianOption[];
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
            <OccurredAtInput
              disabled={disabled}
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
            options={veterinarianOptions}
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

function OccurredAtInput({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange(value: string): void;
  value: string;
}) {
  const [showPicker, setShowPicker] = useState(false);

  function handleChange(event: DateTimePickerEvent, date?: Date): void {
    setShowPicker(false);
    if (event.type === 'set' && date !== undefined) {
      onChange(toLocalDateTimeIso(date.toISOString()));
    }
  }

  return (
    <View style={styles.dateField}>
      <AppButton
        accessibilityLabel={value === '' ? 'Elegir fecha y hora' : `Fecha y hora ${value}`}
        disabled={disabled}
        icon="calendar"
        label={value === '' ? 'Elegir fecha y hora' : formatRecordDate(value)}
        onPress={() => setShowPicker(true)}
        variant="secondary"
      />
      {showPicker ? (
        <DateTimePicker
          display="default"
          mode="datetime"
          onChange={handleChange}
          value={value === '' ? new Date() : new Date(value)}
        />
      ) : null}
    </View>
  );
}

function VeterinarianSelector({
  disabled,
  error,
  onChange,
  options,
  value,
}: {
  disabled: boolean;
  error: string | undefined;
  onChange(value: string): void;
  options: VeterinarianOption[];
  value: string;
}) {
  return (
    <Field error={error} label="Veterinario">
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
  children,
  error,
  label,
}: {
  children: ReactNode;
  error: string | undefined;
  label: string;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
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
  dateField: {
    gap: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.md,
    width: '100%',
  },
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
