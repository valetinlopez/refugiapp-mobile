import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { UserResponse } from '../types';
import { roleLabel } from '../utils/userPresentation';
import {
  createUserSchema,
  managedUserRoles,
  updateUserSchema,
  type CreateUserFormInput,
  type CreateUserFormValues,
  type UpdateUserFormInput,
  type UpdateUserFormValues,
} from '../utils/userSchema';

type UserFormProps =
  | {
      errorMessage?: string | null;
      initialUser?: undefined;
      isSubmitting: boolean;
      mode?: 'create';
      onSubmit(values: CreateUserFormValues): void;
    }
  | {
      errorMessage?: string | null;
      initialUser: UserResponse;
      isSubmitting: boolean;
      mode: 'edit';
      onSubmit(values: UpdateUserFormValues): void;
    };

const FIELD_LABELS = {
  firstName: 'Nombre',
  lastName: 'Apellido',
  email: 'Email',
  password: 'Contraseña inicial',
} as const;

export function UserForm(props: UserFormProps) {
  const { errorMessage, isSubmitting, onSubmit } = props;
  const mode = props.mode ?? 'create';
  const initialUser = mode === 'edit' ? props.initialUser : undefined;

  if (mode === 'edit' && initialUser) {
    return (
      <EditForm
        errorMessage={errorMessage}
        initialUser={initialUser}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit as (values: UpdateUserFormValues) => void}
      />
    );
  }

  return (
    <CreateForm
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit as (values: CreateUserFormValues) => void}
    />
  );
}

function CreateForm({
  errorMessage,
  isSubmitting,
  onSubmit,
}: {
  errorMessage?: string | null | undefined;
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
          render={({ field, fieldState }) => (
            <View style={styles.field}>
              <AppText variant="label">{FIELD_LABELS[name]}</AppText>
              <Input
                accessibilityLabel={FIELD_LABELS[name]}
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
          )}
        />
      ))}
      <RoleSelector control={control} isSubmitting={isSubmitting} name="role" />
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton label="Crear usuario" loading={isSubmitting} onPress={() => void submit()} />
    </View>
  );
}

function EditForm({
  errorMessage,
  initialUser,
  isSubmitting,
  onSubmit,
}: {
  errorMessage?: string | null | undefined;
  initialUser: UserResponse;
  isSubmitting: boolean;
  onSubmit(values: UpdateUserFormValues): void;
}) {
  const { control, handleSubmit } = useForm<UpdateUserFormInput, unknown, UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: initialUser.email,
      firstName: initialUser.firstName,
      lastName: initialUser.lastName,
      role: initialUser.roles[0] ?? 'shelter_manager',
    },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      {(['firstName', 'lastName', 'email'] as const).map((name) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <View style={styles.field}>
              <AppText variant="label">{FIELD_LABELS[name]}</AppText>
              <Input
                accessibilityLabel={FIELD_LABELS[name]}
                autoCapitalize={name === 'email' ? 'none' : 'sentences'}
                autoComplete={
                  name === 'email' ? 'email' : name === 'firstName' ? 'given-name' : 'family-name'
                }
                editable={!isSubmitting}
                keyboardType={name === 'email' ? 'email-address' : 'default'}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
              />
              {fieldState.error ? (
                <AppText color="danger" role="alert">
                  {fieldState.error.message}
                </AppText>
              ) : null}
            </View>
          )}
        />
      ))}
      <RoleSelector control={control} isSubmitting={isSubmitting} name="role" />
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton label="Guardar cambios" loading={isSubmitting} onPress={() => void submit()} />
    </View>
  );
}

function RoleSelector<T extends FieldValues>({
  control,
  isSubmitting,
  name,
}: {
  control: Control<T>;
  isSubmitting: boolean;
  name: 'role';
}) {
  return (
    <Controller
      control={control}
      name={name as Path<T>}
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
