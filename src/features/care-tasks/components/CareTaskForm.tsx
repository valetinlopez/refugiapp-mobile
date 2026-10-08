import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, type ComponentProps, type ReactNode, type Ref } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { DateTimeField, SectionHeader } from '@/components/patterns';
import { AppAvatar, AppBadge, AppButton, AppCard, AppIcon, AppText } from '@/components/primitives';
import { colors, fontFamilies, opacity, radii, sizes, spacing } from '@/theme';

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
}

type CreateProps = BaseProps & {
  animalOptions: AnimalOption[];
  initialAnimalId?: string | undefined;
  mode: 'create';
  onCancel(): void;
  onSubmit(data: CreateCareTaskRequest): void;
};

type EditProps = BaseProps & {
  animalName: string;
  mode: 'edit';
  onSubmit(data: UpdateCareTaskRequest): void;
  responsibleLabel: string;
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
  onCancel,
  onSubmit,
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
      <AppCard style={styles.card} variant="elevated">
        <SectionHeader
          subtitle="Completá los datos necesarios para organizar el cuidado."
          title="Información de la tarea"
        />
        <Controller
          control={control}
          name="animalId"
          render={({ field, fieldState }) => (
            <Field error={fieldState.error?.message} label="Animal *">
              <AnimalSelector
                disabled={isSubmitting}
                onChange={field.onChange}
                options={animalOptions}
                value={field.value}
              />
            </Field>
          )}
        />
        <TaskFields control={control} disabled={isSubmitting} showFieldHints />
      </AppCard>

      <AppCard
        accessibilityLabel="Estado inicial: Pendiente"
        style={styles.statusCard}
        variant="outlined"
      >
        <View style={styles.statusCopy}>
          <View style={styles.statusTitle}>
            <AppIcon color="positive" name="clock" />
            <AppText variant="heading3">Estado inicial</AppText>
          </View>
          <AppText color="textSecondary">
            La tarea se creará como pendiente hasta que alguien la complete o cancele.
          </AppText>
        </View>
        <AppBadge icon="clock" label="Pendiente" tone="warning" />
      </AppCard>

      <FormError message={errorMessage} />
      <View style={styles.actions}>
        <AppButton
          disabled={isSubmitting}
          label="Cancelar"
          onPress={onCancel}
          style={styles.actionButton}
          variant="secondary"
        />
        <AppButton
          icon="add"
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
          style={styles.actionButton}
        />
      </View>
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

function AnimalSelector({
  disabled,
  onChange,
  options,
  value,
}: {
  disabled: boolean;
  onChange(value: string): void;
  options: AnimalOption[];
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((animal) => animal.id === value);

  return (
    <>
      <Pressable
        accessibilityLabel={
          selected ? 'Animal seleccionado: ' + selected.name : 'Seleccionar animal'
        }
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        hitSlop={sizes.hitSlop}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
      >
        {selected ? (
          <AppAvatar
            accessibilityLabel={'Foto de ' + selected.name}
            initials={selected.name}
            size="sm"
          />
        ) : (
          <View style={styles.selectorIcon}>
            <AppIcon color="positive" name="paw" />
          </View>
        )}
        <View style={styles.selectorCopy}>
          <AppText color={selected ? 'textPrimary' : 'textSecondary'}>
            {selected?.name ?? 'Elegí un animal'}
          </AppText>
          <AppText color="textSecondary" variant="caption">
            Tocá para ver los animales disponibles
          </AppText>
        </View>
        <AppIcon color="textSecondary" name="chevronRight" />
      </Pressable>

      <BottomSheet
        closeAccessibilityLabel="Cerrar selección de animal"
        onClose={() => setOpen(false)}
        testID="animal-selector-sheet"
        title="Seleccionar animal"
        visible={open}
      >
        <View
          accessibilityLabel="Animales disponibles"
          accessibilityRole="radiogroup"
          style={styles.options}
        >
          {options.map((animal) => {
            const checked = animal.id === value;
            return (
              <Pressable
                accessibilityLabel={animal.name}
                accessibilityRole="radio"
                accessibilityState={{ checked, disabled }}
                disabled={disabled}
                hitSlop={sizes.hitSlop}
                key={animal.id}
                onPress={() => {
                  onChange(animal.id);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  checked && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppAvatar
                  accessibilityLabel={'Foto de ' + animal.name}
                  initials={animal.name}
                  size="sm"
                />
                <AppText style={styles.optionName} variant="label">
                  {animal.name}
                </AppText>
                {checked ? <AppIcon color="positive" name="check" /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

function TaskFields({
  control,
  disabled,
  showFieldHints = false,
}: {
  control: ReturnType<typeof useForm<CreateCareTaskFormInput>>['control'];
  disabled: boolean;
  showFieldHints?: boolean;
}) {
  const descriptionRef = useRef<TextInputType>(null);
  return (
    <>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <Field
            action={
              <AppText color="textSecondary" variant="caption">
                {String(field.value.length)} / 160
              </AppText>
            }
            error={fieldState.error?.message}
            label={showFieldHints ? 'Título *' : 'Título'}
          >
            <FormInput
              accessibilityLabel="Título"
              blurOnSubmit={false}
              editable={!disabled}
              maxLength={160}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={() => descriptionRef.current?.focus()}
              placeholder="Ej. Dar medicación"
              returnKeyType="next"
              value={field.value}
            />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <Field
            action={
              showFieldHints && field.value ? (
                <Pressable
                  accessibilityLabel="Limpiar descripción"
                  accessibilityRole="button"
                  disabled={disabled}
                  hitSlop={sizes.hitSlop}
                  onPress={() => field.onChange('')}
                >
                  <AppText color="positive" variant="label">
                    Limpiar
                  </AppText>
                </Pressable>
              ) : undefined
            }
            error={fieldState.error?.message}
            label={showFieldHints ? 'Descripción (opcional)' : 'Descripción'}
          >
            <FormInput
              accessibilityLabel="Descripción"
              editable={!disabled}
              multiline
              numberOfLines={4}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Indicaciones para realizar el cuidado"
              ref={descriptionRef}
              returnKeyType="default"
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
          <Field
            error={fieldState.error?.message}
            label={showFieldHints ? 'Fecha de vencimiento (opcional)' : 'Fecha y hora'}
          >
            <DateTimeField
              accessibilityLabel={showFieldHints ? 'Fecha y hora de vencimiento' : 'Fecha y hora'}
              disabled={disabled}
              minimumDate={new Date()}
              mode="datetime"
              onChange={field.onChange}
              optional
              value={field.value ?? ''}
            />
          </Field>
        )}
      />
    </>
  );
}

function Field({
  action,
  children,
  error,
  label,
}: {
  action?: ReactNode;
  children: ReactNode;
  error: string | undefined;
  label: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <AppText variant="label">{label}</AppText>
        {action}
      </View>
      {children}
      {error ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function FormInput({
  ref,
  style,
  ...props
}: ComponentProps<typeof TextInput> & { ref?: Ref<TextInput> }) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      ref={ref}
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
      <View accessibilityLabel={label + ': ' + value} style={styles.readOnly}>
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
  actionButton: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { gap: spacing.md },
  field: { gap: spacing.xs },
  fieldHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    padding: spacing.sm,
  },
  optionName: { flex: 1 },
  optionSelected: { borderColor: colors.positive, borderWidth: 2 },
  options: { gap: spacing.xs },
  pressed: { opacity: opacity.pressedSubtle },
  readOnly: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selector: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.buttonHeight,
    padding: spacing.sm,
  },
  selectorCopy: { flex: 1, gap: spacing.xxs },
  selectorIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    height: sizes.avatarSm,
    justifyContent: 'center',
    width: sizes.avatarSm,
  },
  statusCard: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statusCopy: { flex: 1, gap: spacing.xs, minWidth: sizes.touchTarget },
  statusTitle: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
});
