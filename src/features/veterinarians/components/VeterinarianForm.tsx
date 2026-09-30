import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import {
  veterinarianFormSchema,
  type VeterinarianFormInput,
  type VeterinarianFormValues,
} from '../utils/veterinarianSchema';

interface VeterinarianFormProps {
  errorMessage?: string | null;
  initialValues?: VeterinarianFormValues;
  isSubmitting: boolean;
  onSubmit(values: VeterinarianFormValues): void;
  submitLabel: string;
}

const DEFAULT_VALUES: VeterinarianFormValues = {
  firstName: '',
  lastName: '',
  licenseNumber: '',
  email: undefined,
  phone: undefined,
  userId: undefined,
  notes: undefined,
};

interface FormFieldConfig {
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
  label: string;
  multiline?: boolean;
  name: FieldName;
}

type FieldName = keyof typeof veterinarianFormSchema.shape;

const FIELDS: readonly FormFieldConfig[] = [
  { name: 'firstName', label: 'Nombre', autoComplete: 'given-name' },
  { name: 'lastName', label: 'Apellido', autoComplete: 'family-name' },
  { name: 'licenseNumber', label: 'Matrícula' },
  {
    name: 'email',
    label: 'Email (opcional)',
    autoCapitalize: 'none',
    autoComplete: 'email',
    keyboardType: 'email-address',
  },
  { name: 'phone', label: 'Teléfono (opcional)', keyboardType: 'phone-pad' },
  { name: 'userId', label: 'ID de usuario vinculado (opcional)', autoCapitalize: 'none' },
  { name: 'notes', label: 'Notas (opcional)', multiline: true },
];

export function VeterinarianForm({
  errorMessage,
  initialValues,
  isSubmitting,
  onSubmit,
  submitLabel,
}: VeterinarianFormProps) {
  const { control, handleSubmit } = useForm<VeterinarianFormInput, unknown, VeterinarianFormValues>(
    {
      resolver: zodResolver(veterinarianFormSchema),
      defaultValues: initialValues ?? DEFAULT_VALUES,
    }
  );
  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      {FIELDS.map((field) => (
        <Controller
          key={field.name}
          control={control}
          name={field.name as FieldName}
          render={({ field: fieldController, fieldState }) => {
            const inputProps: TextInputProps = {
              autoCapitalize: field.autoCapitalize,
              autoComplete: field.autoComplete,
              editable: !isSubmitting,
              keyboardType: field.keyboardType,
              multiline: field.multiline,
              onBlur: fieldController.onBlur,
              onChangeText: fieldController.onChange,
              value: fieldController.value ?? '',
            };
            return (
              <Field
                error={fieldState.error?.message ?? null}
                label={field.label}
                {...inputProps}
              />
            );
          }}
        />
      ))}
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton label={submitLabel} loading={isSubmitting} onPress={() => void submit()} />
    </View>
  );
}

function Field(props: TextInputProps & { error?: string | null; label: string }) {
  const { error, label, style, ...inputProps } = props;
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, inputProps.multiline === true && styles.multiline, style]}
        {...inputProps}
      />
      {error ? (
        <AppText color="danger" role="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
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
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
