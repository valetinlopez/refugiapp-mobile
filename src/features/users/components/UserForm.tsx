import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import {
  createUserSchema,
  managedUserRoles,
  type CreateUserFormInput,
  type CreateUserFormValues,
} from '../utils/userSchema';
import { roleLabel } from '../utils/userPresentation';

export function UserForm({
  errorMessage,
  isSubmitting,
  onSubmit,
}: {
  errorMessage?: string | null;
  isSubmitting: boolean;
  onSubmit(values: CreateUserFormValues): void;
}) {
  const { control, handleSubmit } = useForm<CreateUserFormInput, unknown, CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'shelter_manager',
    },
  });
  const submit = handleSubmit(onSubmit);
  const autoComplete = {
    email: 'email',
    firstName: 'given-name',
    lastName: 'family-name',
    password: 'new-password',
  } as const;

  return (
    <View style={styles.form}>
      {(['firstName', 'lastName', 'email', 'password'] as const).map((name) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => {
            const labels = {
              firstName: 'Nombre',
              lastName: 'Apellido',
              email: 'Email',
              password: 'Contraseña inicial',
            };
            return (
              <View style={styles.field}>
                <AppText variant="label">{labels[name]}</AppText>
                <Input
                  accessibilityLabel={labels[name]}
                  autoCapitalize={name === 'email' ? 'none' : 'sentences'}
                  autoComplete={autoComplete[name]}
                  editable={!isSubmitting}
                  keyboardType={name === 'email' ? 'email-address' : 'default'}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  secureTextEntry={name === 'password'}
                  value={field.value}
                />
                {fieldState.error ? (
                  <AppText color="danger" role="alert">
                    {fieldState.error.message}
                  </AppText>
                ) : null}
              </View>
            );
          }}
        />
      ))}
      <Controller
        control={control}
        name="role"
        render={({ field, fieldState }) => (
          <View style={styles.field}>
            <AppText variant="label">Rol</AppText>
            <View accessibilityRole="radiogroup" style={styles.options}>
              {managedUserRoles.map((role) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: field.value === role, disabled: isSubmitting }}
                  disabled={isSubmitting}
                  key={role}
                  onPress={() => field.onChange(role)}
                  style={[styles.option, field.value === role && styles.selected]}
                >
                  <AppText>{roleLabel(role)}</AppText>
                </Pressable>
              ))}
            </View>
            {fieldState.error ? (
              <AppText color="danger" role="alert">
                {fieldState.error.message}
              </AppText>
            ) : null}
          </View>
        )}
      />
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton label="Crear usuario" loading={isSubmitting} onPress={() => void submit()} />
    </View>
  );
}

function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textSecondary} style={styles.input} {...props} />;
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
  option: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  options: { gap: spacing.xs },
  selected: { borderColor: colors.positive },
});
