import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, Switch, TextInput, View, type TextInputProps } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import {
  veterinarianFormSchema,
  type VeterinarianFieldName,
  type VeterinarianFormInput,
  type VeterinarianFormMode,
  type VeterinarianFormValues,
} from '../utils/veterinarianSchema';

interface VeterinarianFormProps {
  errorMessage?: string | null;
  initialValues?: VeterinarianFormValues;
  isSubmitting: boolean;
  mode?: VeterinarianFormMode;
  onSubmit(values: VeterinarianFormValues): void;
  submitLabel: string;
}

const DEFAULT_VALUES: VeterinarianFormValues = {
  firstName: '',
  lastName: '',
  licenseNumber: '',
  email: undefined,
  phone: undefined,
  notes: undefined,
  shouldCreateUser: false,
  createUserEmail: undefined,
  createUserPassword: undefined,
};

interface FormFieldConfig {
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
  label: string;
  multiline?: boolean;
  name: TextFieldName;
  secureTextEntry?: boolean;
  textContentType?: TextInputProps['textContentType'];
}

type TextFieldName = Exclude<VeterinarianFieldName, 'shouldCreateUser'>;

const BASE_FIELDS: readonly FormFieldConfig[] = [
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
  { name: 'notes', label: 'Notas (opcional)', multiline: true },
];

const CREATE_USER_FIELDS: readonly FormFieldConfig[] = [
  {
    name: 'createUserEmail',
    label: 'Email del usuario',
    autoCapitalize: 'none',
    autoComplete: 'email',
    keyboardType: 'email-address',
  },
  {
    name: 'createUserPassword',
    label: 'Contraseña inicial',
    autoComplete: 'new-password',
    secureTextEntry: true,
    textContentType: 'newPassword',
  },
];

export function VeterinarianForm({
  errorMessage,
  initialValues,
  isSubmitting,
  mode = 'create',
  onSubmit,
  submitLabel,
}: VeterinarianFormProps) {
  const { control, handleSubmit } = useForm<VeterinarianFormInput, unknown, VeterinarianFormValues>(
    {
      resolver: zodResolver(veterinarianFormSchema),
      defaultValues: initialValues ?? DEFAULT_VALUES,
    }
  );
  const shouldCreateUser = useWatch({ control, name: 'shouldCreateUser' });
  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      {BASE_FIELDS.map((field) => (
        <FieldController
          key={field.name}
          control={control}
          field={field}
          isSubmitting={isSubmitting}
        />
      ))}

      {mode === 'create' ? (
        <View style={styles.createUserSection}>
          <AppText variant="label">Crear acceso para el veterinario</AppText>
          <Controller
            control={control}
            name="shouldCreateUser"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <AppText>Crear usuario de acceso</AppText>
                  <AppText color="textSecondary" variant="caption">
                    Crea un usuario con rol veterinario y lo vincula automáticamente.
                  </AppText>
                </View>
                <Switch
                  accessibilityHint="Si se activa, se crea un usuario con rol veterinario en la misma operación."
                  accessibilityLabel="Crear usuario de acceso"
                  disabled={isSubmitting}
                  onValueChange={onChange}
                  thumbColor={value ? colors.textPrimary : colors.disabledText}
                  trackColor={{ false: colors.disabledSurface, true: colors.info }}
                  value={value}
                />
              </View>
            )}
          />
          {shouldCreateUser ? (
            <View style={styles.createUserFields}>
              {CREATE_USER_FIELDS.map((field) => (
                <FieldController
                  key={field.name}
                  control={control}
                  field={field}
                  isSubmitting={isSubmitting}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton label={submitLabel} loading={isSubmitting} onPress={() => void submit()} />
    </View>
  );
}

interface FieldControllerProps {
  control: ReturnType<
    typeof useForm<VeterinarianFormInput, unknown, VeterinarianFormValues>
  >['control'];
  field: FormFieldConfig;
  isSubmitting: boolean;
}

function FieldController({ control, field, isSubmitting }: FieldControllerProps) {
  return (
    <Controller
      control={control}
      name={field.name}
      render={({ field: fieldController, fieldState }) => {
        const inputProps: TextInputProps = {
          autoCapitalize: field.autoCapitalize,
          autoComplete: field.autoComplete,
          editable: !isSubmitting,
          keyboardType: field.keyboardType,
          multiline: field.multiline,
          onBlur: fieldController.onBlur,
          onChangeText: fieldController.onChange,
          secureTextEntry: field.secureTextEntry,
          textContentType: field.textContentType,
          value: fieldController.value ?? '',
        };
        return (
          <Field error={fieldState.error?.message ?? null} label={field.label} {...inputProps} />
        );
      }}
    />
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
  createUserFields: { gap: spacing.md },
  createUserSection: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
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
  switchCopy: { flex: 1, gap: spacing.xxs },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 44,
  },
});
