import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/primitives';
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

export function FormField({
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
}

export type AnimalCreateModeProps = AnimalProfileFormBaseProps & {
  mode: 'create';
  onSubmit(input: CreateAnimalInput): void;
};

export type AnimalEditModeProps = AnimalProfileFormBaseProps & {
  mode: 'edit';
  animal: Animal;
  currentPhotoUri: string | null;
  onSubmit(input: UpdateAnimalInput): void;
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
  onSubmit,
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
            <FormTextInput
              accessibilityLabel="Fecha de ingreso"
              autoCapitalize="none"
              autoComplete="off"
              editable={!isSubmitting}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD"
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
            <FormTextInput
              accessibilityLabel="Fecha de nacimiento"
              autoCapitalize="none"
              autoComplete="off"
              editable={!isSubmitting}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD (opcional)"
              value={field.value ?? ''}
            />
          </FormField>
        )}
      />
      <View style={styles.field}>
        <AppText variant="label">Foto de perfil</AppText>
        <ProfilePhotoPicker disabled={isSubmitting} onChange={setPhoto} value={photo} />
      </View>
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

function EditProfileForm({
  animal,
  currentPhotoUri,
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: AnimalEditModeProps) {
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const { control, handleSubmit } = useForm<UpdateAnimalFormInput>({
    resolver: zodResolver(updateAnimalSchema),
    defaultValues: toUpdateAnimalFormValues(animal),
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
        name="intakeDate"
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message} label="Fecha de ingreso">
            <FormTextInput
              accessibilityLabel="Fecha de ingreso"
              autoCapitalize="none"
              autoComplete="off"
              editable={!isSubmitting}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD"
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
            <FormTextInput
              accessibilityLabel="Fecha de nacimiento"
              autoCapitalize="none"
              autoComplete="off"
              editable={!isSubmitting}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-DD (opcional)"
              value={field.value ?? ''}
            />
          </FormField>
        )}
      />
      <View style={styles.field}>
        <AppText variant="label">Foto de perfil</AppText>
        <ProfilePhotoPicker
          disabled={isSubmitting}
          fallbackUri={currentPhotoUri}
          onChange={setPhoto}
          value={photo}
        />
      </View>
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton
        label="Guardar cambios"
        loading={isSubmitting}
        onPress={() =>
          void handleSubmit((rawValues) => {
            const values = updateAnimalSchema.parse(rawValues);
            onSubmit({ form: values, photo });
          })()
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
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
