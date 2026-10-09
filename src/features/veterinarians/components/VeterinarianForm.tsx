import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, Switch, TextInput, View, type TextInputProps } from 'react-native';

import { PasswordField, SectionHeader } from '@/components/patterns';
import { AppBadge, AppButton, AppCard, AppIcon, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { VeterinarianCreateConflictField } from '../utils/veterinarianPresentation';
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
  onCancel?: (() => void) | undefined;
  onFieldChange?: (() => void) | undefined;
  onSubmit(values: VeterinarianFormValues): void;
  serverErrors?: Partial<Record<VeterinarianCreateConflictField, string>> | undefined;
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
  hint?: string;
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
    label: 'Correo electrónico de acceso',
    hint: 'Si lo dejás vacío, se usará el correo profesional indicado arriba.',
    autoCapitalize: 'none',
    autoComplete: 'email',
    keyboardType: 'email-address',
  },
  {
    name: 'createUserPassword',
    label: 'Contraseña inicial',
    hint: 'Mínimo 12 caracteres. No se volverá a mostrar después del alta.',
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
  onCancel,
  onFieldChange,
  onSubmit,
  serverErrors,
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
  const professionalFields = BASE_FIELDS.map((field) => (
    <FieldController
      key={field.name}
      control={control}
      field={field}
      isSubmitting={isSubmitting}
      onFieldChange={onFieldChange}
      serverError={field.name === 'licenseNumber' ? serverErrors?.licenseNumber : undefined}
    />
  ));

  return (
    <View style={styles.form}>
      {mode === 'create' ? (
        <AppCard style={styles.card} variant="elevated">
          <SectionHeader
            subtitle="Datos de identificación y contacto profesional."
            title="Información profesional"
          />
          {professionalFields}
        </AppCard>
      ) : (
        professionalFields
      )}

      {mode === 'create' ? (
        <AppCard style={styles.card} variant="elevated">
          <SectionHeader
            action={<AppBadge icon="medical" label="Rol Veterinario" tone="info" />}
            subtitle="Opcional. La cuenta se crea o reutiliza junto con el perfil."
            title="Acceso a Refugiapp"
          />
          <Controller
            control={control}
            name="shouldCreateUser"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <AppText variant="label">Crear usuario de acceso</AppText>
                  <AppText color="textSecondary" variant="caption">
                    El servidor lo vincula de forma atómica y asigna únicamente el rol Veterinario.
                  </AppText>
                </View>
                <Switch
                  accessibilityHint="Si se activa, se crea un usuario con rol veterinario en la misma operación."
                  accessibilityLabel="Crear usuario de acceso"
                  disabled={isSubmitting}
                  onValueChange={(nextValue) => {
                    onChange(nextValue);
                    onFieldChange?.();
                  }}
                  thumbColor={value ? colors.textPrimary : colors.disabledText}
                  trackColor={{ false: colors.disabledSurface, true: colors.positive }}
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
                  onFieldChange={onFieldChange}
                  serverError={
                    field.name === 'createUserEmail' ? serverErrors?.createUserEmail : undefined
                  }
                />
              ))}
              <View accessibilityRole="summary" style={styles.atomicHelp}>
                <AppIcon color="info" name="info" size={sizes.iconSm} />
                <AppText color="textSecondary" style={styles.atomicHelpCopy} variant="caption">
                  Si el correo ya pertenece a un usuario disponible, se reutiliza la cuenta. Si el
                  alta falla, no queda un usuario sin perfil profesional.
                </AppText>
              </View>
            </View>
          ) : null}
        </AppCard>
      ) : null}

      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        {mode === 'create' && onCancel ? (
          <AppButton
            disabled={isSubmitting}
            label="Cancelar"
            onPress={onCancel}
            style={styles.action}
            testID="create-veterinarian-cancel"
            variant="secondary"
          />
        ) : null}
        <AppButton
          icon="check"
          label={submitLabel}
          loading={isSubmitting}
          onPress={() => void submit()}
          style={styles.action}
          testID={mode === 'create' ? 'create-veterinarian-submit' : undefined}
        />
      </View>
    </View>
  );
}

interface FieldControllerProps {
  control: ReturnType<
    typeof useForm<VeterinarianFormInput, unknown, VeterinarianFormValues>
  >['control'];
  field: FormFieldConfig;
  isSubmitting: boolean;
  onFieldChange?: (() => void) | undefined;
  serverError?: string | undefined;
}

function FieldController({
  control,
  field,
  isSubmitting,
  onFieldChange,
  serverError,
}: FieldControllerProps) {
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
          onChangeText: (value) => {
            fieldController.onChange(value);
            onFieldChange?.();
          },
          secureTextEntry: field.secureTextEntry,
          textContentType: field.textContentType,
          value: fieldController.value ?? '',
        };
        const error = fieldState.error?.message ?? serverError ?? null;

        if (field.secureTextEntry) {
          const { secureTextEntry: _secureTextEntry, ...passwordInputProps } = inputProps;
          return (
            <View style={styles.field}>
              <PasswordField {...passwordInputProps} label={field.label} />
              {field.hint ? (
                <AppText color="textSecondary" variant="caption">
                  {field.hint}
                </AppText>
              ) : null}
              <FieldError message={error} />
            </View>
          );
        }

        return <Field error={error} hint={field.hint} label={field.label} {...inputProps} />;
      }}
    />
  );
}

function Field(
  props: TextInputProps & { error?: string | null; hint?: string | undefined; label: string }
) {
  const { error, hint, label, style, ...inputProps } = props;
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, inputProps.multiline === true && styles.multiline, style]}
        {...inputProps}
      />
      {hint ? (
        <AppText color="textSecondary" variant="caption">
          {hint}
        </AppText>
      ) : null}
      <FieldError message={error} />
    </View>
  );
}

function FieldError({ message }: { message?: string | null | undefined }) {
  return message ? (
    <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
      {message}
    </AppText>
  ) : null;
}

const styles = StyleSheet.create({
  action: { flex: 1, minWidth: 160 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  atomicHelp: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  atomicHelpCopy: { flex: 1, minWidth: 0 },
  card: { gap: spacing.md },
  createUserFields: { gap: spacing.md },
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
