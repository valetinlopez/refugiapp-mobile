import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Controller, useForm, type FieldErrors } from 'react-hook-form';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type LayoutChangeEvent,
  type TextInputProps,
} from 'react-native';

import { MediaUploadStatus } from '@/components/feedback';
import { AppButton, AppCard, AppIcon, AppText } from '@/components/primitives';
import { DateTimeField, SectionHeader, SegmentedControl } from '@/components/patterns';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { PhotoFile } from '../api/mediaApi';
import type { CreateAnimalInput } from '../hooks/useCreateAnimal';
import type { UpdateAnimalInput } from '../hooks/useUpdateAnimal';
import type { Animal, AnimalSex, AnimalStatus } from '../types';
import { createAnimalSchema, type CreateAnimalFormInput } from '../utils/createAnimalSchema';
import { toUpdateAnimalFormValues } from '../utils/toUpdateAnimalFormValues';
import { updateAnimalSchema, type UpdateAnimalFormInput } from '../utils/updateAnimalSchema';

import { ProfilePhotoPicker } from './ProfilePhotoPicker';

export const SEX_OPTIONS: { label: string; value: AnimalSex }[] = [
  { label: 'Hembra', value: 'female' },
  { label: 'Macho', value: 'male' },
  { label: 'Desconocido', value: 'unknown' },
];

export const STATUS_OPTIONS: { label: string; value: AnimalStatus }[] = [
  { label: 'Ingresado', value: 'admitted' },
  { label: 'En tratamiento', value: 'under_treatment' },
  { label: 'Disponible para adopción', value: 'available_for_adoption' },
  { label: 'Adoptado', value: 'adopted' },
  { label: 'Fallecido', value: 'deceased' },
];

export function ModifiedIndicator({ label }: { label: string }) {
  return (
    <View
      accessibilityLabel={`${label} modificado`}
      accessibilityRole="text"
      style={styles.modified}
    >
      <View style={styles.modifiedDot} />
      <AppText color="textSecondary" variant="caption">
        Modificado
      </AppText>
    </View>
  );
}

export function FormField({
  children,
  error,
  label,
  modified = false,
  onLayout,
}: {
  children: ReactNode;
  error: string | undefined;
  label: string;
  modified?: boolean | undefined;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  return (
    <View onLayout={onLayout} style={styles.field}>
      <View style={styles.labelRow}>
        <AppText variant="label">{label}</AppText>
        {modified ? <ModifiedIndicator label={label} /> : null}
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

export function OptionGroup<T extends string>({
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
    <FormField error={error} label={label}>
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
              hitSlop={sizes.hitSlop}
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
    </FormField>
  );
}

export function FormTextInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, style]}
      {...props}
    />
  );
}

interface AnimalProfileFormBaseProps {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onCancelUpload?(): void;
  upload?: { fileName: string; progress: number } | null;
}

export type AnimalCreateModeProps = AnimalProfileFormBaseProps & {
  mode: 'create';
  onSubmit(input: CreateAnimalInput): void;
};

export type AnimalEditModeProps = AnimalProfileFormBaseProps & {
  mode: 'edit';
  animal: Animal;
  currentPhotoUri: string | null;
  onDiscard?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSubmit(input: UpdateAnimalInput): void;
  photoErrorMessage?: string | null;
  scrollRef?: RefObject<ScrollView | null>;
};

export type AnimalProfileFormProps = AnimalCreateModeProps | AnimalEditModeProps;

export function AnimalProfileForm(props: AnimalProfileFormProps) {
  if (props.mode === 'edit') {
    return <EditProfileForm {...props} />;
  }
  return <CreateProfileForm {...props} />;
}

function CreateProfileForm({
  errorMessage,
  isSubmitting = false,
  onCancelUpload,
  onSubmit,
  upload,
}: AnimalCreateModeProps) {
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const { control, handleSubmit } = useForm<CreateAnimalFormInput>({
    resolver: zodResolver(createAnimalSchema),
    defaultValues: {
      name: '',
      species: '',
      breed: '',
      sex: 'unknown',
      status: 'admitted',
      intakeDate: '',
      birthDate: '',
    },
    mode: 'onTouched',
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message} label="Nombre">
            <FormTextInput
              accessibilityLabel="Nombre"
              autoCapitalize="words"
              autoComplete="off"
              editable={!isSubmitting}
              maxLength={120}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Luna"
              value={field.value}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="species"
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message} label="Especie">
            <FormTextInput
              accessibilityLabel="Especie"
              autoCapitalize="words"
              autoComplete="off"
              editable={!isSubmitting}
              maxLength={80}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="dog"
              value={field.value}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="breed"
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message} label="Raza">
            <FormTextInput
              accessibilityLabel="Raza"
              autoCapitalize="words"
              autoComplete="off"
              editable={!isSubmitting}
              maxLength={80}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Mestizo (opcional)"
              value={field.value ?? ''}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="sex"
        render={({ field, fieldState }) => (
          <OptionGroup
            disabled={isSubmitting}
            error={fieldState.error?.message}
            label="Sexo"
            onChange={field.onChange}
            options={SEX_OPTIONS}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field, fieldState }) => (
          <OptionGroup
            disabled={isSubmitting}
            error={fieldState.error?.message}
            label="Estado"
            onChange={field.onChange}
            options={STATUS_OPTIONS}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="intakeDate"
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message} label="Fecha de ingreso">
            <DateTimeField
              accessibilityLabel="Fecha de ingreso"
              disabled={isSubmitting}
              maximumDate={new Date()}
              mode="date"
              onChange={field.onChange}
              value={field.value}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="birthDate"
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message} label="Fecha de nacimiento">
            <DateTimeField
              accessibilityLabel="Fecha de nacimiento"
              disabled={isSubmitting}
              maximumDate={new Date()}
              mode="date"
              onChange={field.onChange}
              optional
              value={field.value ?? ''}
            />
          </FormField>
        )}
      />
      <View style={styles.field}>
        <AppText variant="label">Foto de perfil</AppText>
        <ProfilePhotoPicker disabled={isSubmitting} onChange={setPhoto} value={photo} />
      </View>
      {upload ? (
        <MediaUploadStatus
          fileName={upload.fileName}
          {...(onCancelUpload ? { onCancel: onCancelUpload } : {})}
          progress={upload.progress}
          status="uploading"
        />
      ) : null}
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton
        label="Dar de alta"
        loading={isSubmitting}
        onPress={() =>
          void handleSubmit((rawValues) => {
            const values = createAnimalSchema.parse(rawValues);
            onSubmit({ ...values, photo });
          })()
        }
      />
    </View>
  );
}

const EDIT_FIELD_ORDER: (keyof UpdateAnimalFormInput)[] = [
  'name',
  'species',
  'breed',
  'sex',
  'intakeDate',
  'birthDate',
];
const EDIT_FOCUSABLE_FIELDS: readonly string[] = [
  'name',
  'species',
  'breed',
  'intakeDate',
  'birthDate',
];
type EditGroup = 'photo' | 'identity' | 'dates';
const EDIT_FIELD_GROUP: Partial<Record<keyof UpdateAnimalFormInput, EditGroup>> = {
  name: 'identity',
  species: 'identity',
  breed: 'identity',
  sex: 'identity',
  intakeDate: 'dates',
  birthDate: 'dates',
};

const SEX_SEGMENTS = SEX_OPTIONS.map((option) => ({ id: option.value, label: option.label }));

function EditProfileForm({
  animal,
  currentPhotoUri,
  errorMessage,
  isSubmitting = false,
  onCancelUpload,
  onDiscard,
  onDirtyChange,
  onSubmit,
  photoErrorMessage,
  scrollRef,
  upload,
}: AnimalEditModeProps) {
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const fieldOffsets = useRef<Record<string, number>>({});
  const groupOffsets = useRef<Record<EditGroup, number>>({ dates: 0, identity: 0, photo: 0 });
  const formOffset = useRef(0);
  const {
    control,
    formState: { dirtyFields, isDirty },
    handleSubmit,
    setFocus,
  } = useForm<UpdateAnimalFormInput>({
    resolver: zodResolver(updateAnimalSchema),
    defaultValues: toUpdateAnimalFormValues(animal),
    mode: 'onTouched',
  });

  const photoDirty = photo !== null || removePhoto;
  const dirty = isDirty || photoDirty;

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  function captureFormOffset(event: LayoutChangeEvent): void {
    formOffset.current = event.nativeEvent.layout.y;
  }

  function handleInvalid(errors: FieldErrors<UpdateAnimalFormInput>): void {
    const firstField = EDIT_FIELD_ORDER.find((key) => errors[key] !== undefined);
    if (firstField !== undefined) {
      const group = EDIT_FIELD_GROUP[firstField];
      const y =
        formOffset.current +
        (group === undefined ? 0 : groupOffsets.current[group]) +
        (fieldOffsets.current[firstField] ?? 0);
      scrollRef?.current?.scrollTo({ animated: true, y: Math.max(0, y - spacing.md) });
      if (EDIT_FOCUSABLE_FIELDS.includes(firstField)) {
        setFocus(firstField);
      }
    }
  }

  function handlePhotoChange(nextPhoto: PhotoFile): void {
    setPhoto(nextPhoto);
    setRemovePhoto(false);
  }

  function handleRemovePhoto(): void {
    if (photo !== null) {
      setPhoto(null);
      return;
    }
    setRemovePhoto(true);
  }

  function submit(skipPhoto: boolean): void {
    void handleSubmit((rawValues) => {
      const values = updateAnimalSchema.parse(rawValues);
      onSubmit({
        initial: animal,
        form: values,
        photo,
        ...(skipPhoto ? { skipPhoto: true } : {}),
        ...(removePhoto ? { removePhoto: true } : {}),
      });
    }, handleInvalid)();
  }

  return (
    <View onLayout={captureFormOffset} style={styles.form}>
      <AppCard
        onLayout={(event) => {
          groupOffsets.current.photo = event.nativeEvent.layout.y;
        }}
        style={styles.card}
        variant="elevated"
      >
        <SectionHeader title="Foto de perfil" />
        <ProfilePhotoPicker
          disabled={isSubmitting}
          fallbackUri={currentPhotoUri}
          mode="edit"
          onChange={handlePhotoChange}
          onRemove={handleRemovePhoto}
          removed={removePhoto}
          showRemove={photo !== null || animal.profilePhotoMediaId !== null}
          value={photo}
        />
      </AppCard>

      <AppCard
        onLayout={(event) => {
          groupOffsets.current.identity = event.nativeEvent.layout.y;
        }}
        style={styles.card}
        variant="elevated"
      >
        <SectionHeader title="Datos principales" />
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormField
              error={fieldState.error?.message}
              label="Nombre"
              modified={dirtyFields.name}
              onLayout={(event) => {
                fieldOffsets.current.name = event.nativeEvent.layout.y;
              }}
            >
              <FormTextInput
                accessibilityLabel="Nombre"
                autoCapitalize="words"
                autoComplete="off"
                editable={!isSubmitting}
                maxLength={120}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Luna"
                testID="edit-field-name"
                value={field.value}
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="species"
          render={({ field, fieldState }) => (
            <FormField
              error={fieldState.error?.message}
              label="Especie"
              modified={dirtyFields.species}
              onLayout={(event) => {
                fieldOffsets.current.species = event.nativeEvent.layout.y;
              }}
            >
              <FormTextInput
                accessibilityLabel="Especie"
                autoCapitalize="words"
                autoComplete="off"
                editable={!isSubmitting}
                maxLength={80}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="dog"
                testID="edit-field-species"
                value={field.value}
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="breed"
          render={({ field, fieldState }) => (
            <FormField
              error={fieldState.error?.message}
              label="Raza"
              modified={dirtyFields.breed}
              onLayout={(event) => {
                fieldOffsets.current.breed = event.nativeEvent.layout.y;
              }}
            >
              <FormTextInput
                accessibilityLabel="Raza"
                autoCapitalize="words"
                autoComplete="off"
                editable={!isSubmitting}
                maxLength={80}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Mestizo (opcional)"
                testID="edit-field-breed"
                value={field.value ?? ''}
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="sex"
          render={({ field, fieldState }) => (
            <FormField
              error={fieldState.error?.message}
              label="Sexo"
              modified={dirtyFields.sex}
              onLayout={(event) => {
                fieldOffsets.current.sex = event.nativeEvent.layout.y;
              }}
            >
              <SegmentedControl
                accessibilityLabel="Sexo"
                onChange={field.onChange}
                options={SEX_SEGMENTS}
                testID="edit-field-sex"
                value={field.value}
              />
            </FormField>
          )}
        />
      </AppCard>

      <AppCard
        onLayout={(event) => {
          groupOffsets.current.dates = event.nativeEvent.layout.y;
        }}
        style={styles.card}
        variant="elevated"
      >
        <SectionHeader title="Fechas" />
        <Controller
          control={control}
          name="intakeDate"
          render={({ field, fieldState }) => (
            <FormField
              error={fieldState.error?.message}
              label="Fecha de ingreso"
              modified={dirtyFields.intakeDate}
              onLayout={(event) => {
                fieldOffsets.current.intakeDate = event.nativeEvent.layout.y;
              }}
            >
              <DateTimeField
                accessibilityLabel="Fecha de ingreso"
                disabled={isSubmitting}
                maximumDate={new Date()}
                mode="date"
                onChange={field.onChange}
                value={field.value}
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="birthDate"
          render={({ field, fieldState }) => (
            <FormField
              error={fieldState.error?.message}
              label="Fecha de nacimiento"
              modified={dirtyFields.birthDate}
              onLayout={(event) => {
                fieldOffsets.current.birthDate = event.nativeEvent.layout.y;
              }}
            >
              <DateTimeField
                accessibilityLabel="Fecha de nacimiento"
                disabled={isSubmitting}
                maximumDate={new Date()}
                mode="date"
                onChange={field.onChange}
                optional
                value={field.value ?? ''}
              />
            </FormField>
          )}
        />
        <AppText color="textSecondary" variant="caption">
          La fecha de nacimiento debe ser anterior o igual a la fecha de ingreso.
        </AppText>
      </AppCard>

      {upload ? (
        <MediaUploadStatus
          fileName={upload.fileName}
          {...(onCancelUpload ? { onCancel: onCancelUpload } : {})}
          progress={upload.progress}
          status="uploading"
        />
      ) : null}
      {photoErrorMessage ? (
        <View style={styles.photoError}>
          <AppText accessibilityLiveRegion="assertive" color="danger" role="alert">
            {photoErrorMessage}
          </AppText>
          <View style={styles.photoActions}>
            <AppButton
              label="Reintentar"
              loading={isSubmitting}
              onPress={() => submit(false)}
              variant="secondary"
            />
            <AppButton
              disabled={isSubmitting}
              label="Guardar sin foto"
              onPress={() => submit(true)}
              variant="ghost"
            />
          </View>
        </View>
      ) : null}
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <View style={styles.footer}>
        <AppButton
          disabled={isSubmitting}
          label="Descartar"
          onPress={() => onDiscard?.()}
          testID="edit-discard"
          variant="secondary"
        />
        <AppButton
          label="Guardar cambios"
          loading={isSubmitting}
          onPress={() => submit(false)}
          testID="edit-submit"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
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
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  modified: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  modifiedDot: {
    backgroundColor: colors.positive,
    borderRadius: radii.full,
    height: spacing.xs,
    width: spacing.xs,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  optionSelected: {
    borderColor: colors.positive,
  },
  options: {
    gap: spacing.xs,
  },
  photoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoError: {
    gap: spacing.sm,
  },
});
