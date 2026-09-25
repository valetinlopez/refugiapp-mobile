import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, type RefObject } from 'react';
import { Controller, useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { MediaUploadStatus } from '@/components/feedback';
import { DateTimeField } from '@/components/patterns';
import { spacing } from '@/theme';

import type { PhotoFile } from '../api/mediaApi';
import type { CreateAnimalInput } from '../hooks/useCreateAnimal';
import type { UpdateAnimalInput } from '../hooks/useUpdateAnimal';
import { useSpeciesCatalog } from '../hooks/useSpeciesCatalog';
import type { Animal, AnimalSex, AnimalStatus } from '../types';
import { createAnimalSchema, type CreateAnimalFormInput } from '../utils/createAnimalSchema';
import { toUpdateAnimalFormValues } from '../utils/toUpdateAnimalFormValues';
import { updateAnimalSchema, type UpdateAnimalFormInput } from '../utils/updateAnimalSchema';

import { BreedSelect } from './BreedSelect';
import { SpeciesSelect } from './SpeciesSelect';
import { FormField, OptionGroup, FormTextInput } from './formFields';
import { ProfilePhotoPicker } from './ProfilePhotoPicker';

export { FormField, OptionGroup, FormTextInput } from './formFields';

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
  const { control, handleSubmit, setValue } = useForm<CreateAnimalFormInput>({
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
  const speciesValue = useWatch({ control, name: 'species' });
  const catalog = useSpeciesCatalog(speciesValue);

  function changeSpecies(nextSpecies: string): void {
    setValue('species', nextSpecies);
    setValue('breed', '');
  }

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
          <SpeciesSelect
            disabled={isSubmitting}
            error={fieldState.error?.message}
            onChange={changeSpecies}
            onRetry={catalog.retrySpecies}
            options={catalog.speciesOptions}
            status={catalog.speciesStatus}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="breed"
        render={({ field, fieldState }) => (
          <BreedSelect
            key={catalog.selectedSpecies?.id ?? 'custom'}
            disabled={isSubmitting}
            error={fieldState.error?.message}
            onChange={field.onChange}
            onRetry={catalog.retryBreeds}
            options={catalog.breedOptions}
            species={catalog.selectedSpecies}
            status={catalog.breedStatus}
            value={field.value}
          />
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
const EDIT_FOCUSABLE_FIELDS: readonly string[] = ['name', 'intakeDate', 'birthDate'];

function EditProfileForm({
  animal,
  currentPhotoUri,
  errorMessage,
  isSubmitting = false,
  onCancelUpload,
  onSubmit,
  photoErrorMessage,
  scrollRef,
  upload,
}: AnimalEditModeProps) {
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const fieldOffsets = useRef<Record<string, number>>({});
  const formOffset = useRef(0);
  const { control, handleSubmit, setFocus, setValue } = useForm<UpdateAnimalFormInput>({
    resolver: zodResolver(updateAnimalSchema),
    defaultValues: toUpdateAnimalFormValues(animal),
    mode: 'onTouched',
  });
  const speciesValue = useWatch({ control, name: 'species' });
  const catalog = useSpeciesCatalog(speciesValue);

  function captureFormOffset(event: LayoutChangeEvent): void {
    formOffset.current = event.nativeEvent.layout.y;
  }

  function captureFieldOffset(name: string) {
    return (event: LayoutChangeEvent) => {
      fieldOffsets.current[name] = event.nativeEvent.layout.y;
    };
  }

  function handleInvalid(errors: FieldErrors<UpdateAnimalFormInput>): void {
    const firstField = EDIT_FIELD_ORDER.find((key) => errors[key] !== undefined);
    if (firstField !== undefined) {
      const y = formOffset.current + (fieldOffsets.current[firstField] ?? 0);
      scrollRef?.current?.scrollTo({ animated: true, y: Math.max(0, y - spacing.md) });
      if (EDIT_FOCUSABLE_FIELDS.includes(firstField)) {
        setFocus(firstField);
      }
    }
  }

  function changeSpecies(nextSpecies: string): void {
    setValue('species', nextSpecies);
    setValue('breed', '');
  }

  function submit(skipPhoto: boolean): void {
    void handleSubmit((rawValues) => {
      const values = updateAnimalSchema.parse(rawValues);
      onSubmit({
        initial: animal,
        form: values,
        photo,
        ...(skipPhoto ? { skipPhoto: true } : {}),
      });
    }, handleInvalid)();
  }

  return (
    <View onLayout={captureFormOffset} style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FormField
            error={fieldState.error?.message}
            label="Nombre"
            onLayout={captureFieldOffset('name')}
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
              value={field.value}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="species"
        render={({ field, fieldState }) => (
          <SpeciesSelect
            disabled={isSubmitting}
            error={fieldState.error?.message}
            onChange={changeSpecies}
            onLayout={captureFieldOffset('species')}
            onRetry={catalog.retrySpecies}
            options={catalog.speciesOptions}
            status={catalog.speciesStatus}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="breed"
        render={({ field, fieldState }) => (
          <BreedSelect
            key={catalog.selectedSpecies?.id ?? 'custom'}
            disabled={isSubmitting}
            error={fieldState.error?.message}
            onChange={field.onChange}
            onLayout={captureFieldOffset('breed')}
            onRetry={catalog.retryBreeds}
            options={catalog.breedOptions}
            species={catalog.selectedSpecies}
            status={catalog.breedStatus}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="sex"
        render={({ field, fieldState }) => (
          <FormField
            error={fieldState.error?.message}
            label="Sexo"
            onLayout={captureFieldOffset('sex')}
          >
            <OptionGroup
              disabled={isSubmitting}
              error={fieldState.error?.message}
              label="Sexo"
              onChange={field.onChange}
              options={SEX_OPTIONS}
              value={field.value}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="intakeDate"
        render={({ field, fieldState }) => (
          <FormField
            error={fieldState.error?.message}
            label="Fecha de ingreso"
            onLayout={captureFieldOffset('intakeDate')}
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
            onLayout={captureFieldOffset('birthDate')}
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
      <View style={styles.field}>
        <AppText variant="label">Foto de perfil</AppText>
        <ProfilePhotoPicker
          disabled={isSubmitting}
          fallbackUri={currentPhotoUri}
          onChange={setPhoto}
          value={photo}
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
      <AppButton label="Guardar cambios" loading={isSubmitting} onPress={() => submit(false)} />
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
  photoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoError: {
    gap: spacing.sm,
  },
});
