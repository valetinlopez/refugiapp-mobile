import { zodResolver } from '@hookform/resolvers/zod';
import { type ComponentProps, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type {
  AnimalOption,
  CareTask,
  CreateCareTaskRequest,
  UpdateCareTaskRequest,
} from '../types';
import {
  createCareTaskSchema,
  type CreateCareTaskFormInput,
  updateCareTaskSchema,
} from '../utils/careTaskSchema';

interface BaseProps {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  responsibleLabel: string;
}

type CreateProps = BaseProps & {
  animalOptions: AnimalOption[];
  initialAnimalId?: string | undefined;
  mode: 'create';
  onSubmit(data: CreateCareTaskRequest): void;
};

type EditProps = BaseProps & {
  animalName: string;
  mode: 'edit';
  onSubmit(data: UpdateCareTaskRequest): void;
  task: CareTask;
};

export type CareTaskFormProps = CreateProps | EditProps;

export function CareTaskForm(props: CareTaskFormProps) {
  return props.mode === 'create' ? <CreateForm {...props} /> : <EditForm {...props} />;
}

function CreateForm({
  animalOptions,
  errorMessage,
  initialAnimalId,
  isSubmitting = false,
  onSubmit,
  responsibleLabel,
}: CreateProps) {
  const { control, handleSubmit } = useForm<CreateCareTaskFormInput>({
    resolver: zodResolver(createCareTaskSchema),
    defaultValues: {
      animalId: initialAnimalId ?? '',
      title: '',
      description: '',
      dueAt: '',
    },
    mode: 'onTouched',
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="animalId"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Animal">
            <View accessibilityLabel="Animal" accessibilityRole="radiogroup" style={styles.options}>
              {animalOptions.map((animal) => {
                const selected = field.value === animal.id;
                return (
                  <Pressable
                    accessibilityLabel={animal.name}
                    accessibilityRole="radio"
                    accessibilityState={{ disabled: isSubmitting, selected }}
                    disabled={isSubmitting}
                    key={animal.id}
                    onPress={() => field.onChange(animal.id)}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <AppText variant="label">{animal.name}</AppText>
                  </Pressable>
                );
              })}
            </View>
          </Field>
        )}
      />
      <TaskFields control={control} disabled={isSubmitting} />
      <Responsible label={responsibleLabel} />
      <FormError message={errorMessage} />
      <AppButton
        label="Crear tarea"
        loading={isSubmitting}
        onPress={() =>
          void handleSubmit((raw) => {
            const values = createCareTaskSchema.parse(raw);
            onSubmit({
              animalId: values.animalId,
              title: values.title,
              ...(values.description ? { description: values.description } : {}),
              ...(values.dueAt ? { dueAt: values.dueAt } : {}),
            });
          })()
        }
      />
    </View>
  );
}

function EditForm({
  animalName,
  errorMessage,
  isSubmitting = false,
  onSubmit,
  responsibleLabel,
  task,
}: EditProps) {
  const { control, handleSubmit } = useForm<CreateCareTaskFormInput>({
    resolver: zodResolver(createCareTaskSchema),
    defaultValues: {
      animalId: task.animalId,
      title: task.title,
      description: task.description ?? '',
      dueAt: task.dueAt ?? '',
    },
    mode: 'onTouched',
  });

  return (
    <View style={styles.form}>
      <ReadOnlyField label="Animal" value={animalName} />
      <TaskFields control={control} disabled={isSubmitting} />
      <Responsible label={responsibleLabel} />
      <FormError message={errorMessage} />
      <AppButton
        label="Guardar cambios"
        loading={isSubmitting}
        onPress={() =>
          void handleSubmit((raw) => {
            const values = updateCareTaskSchema.parse(raw);
            onSubmit({
              title: values.title,
              description: values.description ?? null,
              dueAt: values.dueAt ?? null,
            });
          })()
        }
      />
    </View>
  );
}

function TaskFields({
  control,
  disabled,
}: {
  control: ReturnType<typeof useForm<CreateCareTaskFormInput>>['control'];
  disabled: boolean;
}) {
  return (
    <>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Título">
            <FormInput
              accessibilityLabel="Título"
              editable={!disabled}
              maxLength={160}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Ej. Dar medicación"
              value={field.value}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Descripción">
            <FormInput
              accessibilityLabel="Descripción"
              editable={!disabled}
              multiline
              numberOfLines={4}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Indicaciones opcionales"
              style={styles.multiline}
              textAlignVertical="top"
              value={field.value ?? ''}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="dueAt"
        render={({ field, fieldState }) => (
          <Field error={fieldState.error?.message} label="Fecha y hora">
            <FormInput
              accessibilityLabel="Fecha y hora"
              autoCapitalize="none"
              editable={!disabled}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="2026-09-22T18:00:00-03:00 (opcional)"
              value={field.value ?? ''}
            />
          </Field>
        )}
      />
    </>
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

function FormInput({ style, ...props }: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, style]}
      {...props}
    />
  );
}

function Responsible({ label }: { label: string }) {
  return <ReadOnlyField label="Responsable del registro" value={label} />;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View accessibilityLabel={`${label}: ${value}`} style={styles.readOnly}>
        <AppText color="textSecondary">{value}</AppText>
      </View>
    </View>
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
  field: { gap: spacing.xs },
  form: { gap: spacing.md, width: '100%' },
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
  multiline: { minHeight: 112 },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  optionSelected: { borderColor: colors.positive },
  options: { gap: spacing.xs },
  readOnly: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
