import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { PasswordField, SectionHeader } from '@/components/patterns';
import { AppButton, AppCard, AppIcon, AppText, type AppIconName } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { ManagedUserRole, UserResponse } from '../types';
import { roleDescription, roleLabel } from '../utils/userPresentation';
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
      onCancel(): void;
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
  email: 'Correo electrónico',
  password: 'Contraseña inicial',
} as const;

const ROLE_ICONS: Record<ManagedUserRole, AppIconName> = {
  admin: 'account',
  shelter_manager: 'paw',
  veterinarian: 'medical',
};

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
      onCancel={(props as Extract<UserFormProps, { initialUser?: undefined }>).onCancel}
      onSubmit={onSubmit as (values: CreateUserFormValues) => void}
    />
  );
}

function CreateForm({
  errorMessage,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  errorMessage?: string | null | undefined;
  isSubmitting: boolean;
  onCancel(): void;
  onSubmit(values: CreateUserFormValues): void;
}) {
  const { control, handleSubmit } = useForm<CreateUserFormInput, unknown, CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      roles: ['shelter_manager'],
    },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <AppCard style={styles.card} variant="elevated">
        <SectionHeader subtitle="Información básica de la persona." title="Datos personales" />
        {(['firstName', 'lastName'] as const).map((name) => (
          <TextFieldController
            autoComplete={name === 'firstName' ? 'given-name' : 'family-name'}
            control={control}
            disabled={isSubmitting}
            key={name}
            label={FIELD_LABELS[name]}
            name={name}
            testID={`create-user-${name === 'firstName' ? 'first-name' : 'last-name'}`}
          />
        ))}
      </AppCard>

      <AppCard style={styles.card} variant="elevated">
        <SectionHeader
          subtitle="Estas credenciales se usarán en el primer ingreso."
          title="Acceso inicial"
        />
        <TextFieldController
          autoCapitalize="none"
          autoComplete="email"
          control={control}
          disabled={isSubmitting}
          keyboardType="email-address"
          label={FIELD_LABELS.email}
          name="email"
          testID="create-user-email"
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <View style={styles.field}>
              <PasswordField
                autoComplete="new-password"
                editable={!isSubmitting}
                label={FIELD_LABELS.password}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                testID="create-user-password"
                value={field.value}
              />
              <AppText color="textSecondary" variant="caption">
                Mínimo 12 caracteres. No se volverá a mostrar después de crear la cuenta.
              </AppText>
              <FieldError message={fieldState.error?.message} />
            </View>
          )}
        />
      </AppCard>

      <AppCard style={styles.card} variant="elevated">
        <SectionHeader
          subtitle="Podés asignar más de un rol según sus responsabilidades."
          title="Roles"
        />
        <CreateRoleSelector control={control} isSubmitting={isSubmitting} />
      </AppCard>

      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <AppButton
          disabled={isSubmitting}
          label="Cancelar"
          onPress={onCancel}
          style={styles.action}
          variant="secondary"
        />
        <AppButton
          label="Revisar y crear"
          loading={isSubmitting}
          onPress={() => void submit()}
          style={styles.action}
        />
      </View>
    </View>
  );
}

function TextFieldController<T extends FieldValues>({
  autoCapitalize = 'sentences',
  autoComplete,
  control,
  disabled,
  keyboardType = 'default',
  label,
  name,
  testID,
}: {
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete: TextInputProps['autoComplete'];
  control: Control<T>;
  disabled: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  label: string;
  name: Path<T>;
  testID?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.field}>
          <AppText variant="label">{label}</AppText>
          <Input
            accessibilityLabel={label}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            editable={!disabled}
            keyboardType={keyboardType}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            testID={testID}
            value={typeof field.value === 'string' ? field.value : ''}
          />
          <FieldError message={fieldState.error?.message} />
        </View>
      )}
    />
  );
}

function CreateRoleSelector({
  control,
  isSubmitting,
}: {
  control: Control<CreateUserFormInput>;
  isSubmitting: boolean;
}) {
  return (
    <Controller
      control={control}
      name="roles"
      render={({ field, fieldState }) => (
        <View style={styles.field}>
          <View accessibilityLabel="Roles disponibles" style={styles.options}>
            {managedUserRoles.map((role) => {
              const checked = field.value.includes(role);
              return (
                <Pressable
                  accessibilityHint={roleDescription(role)}
                  accessibilityLabel={roleLabel(role)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked, disabled: isSubmitting }}
                  disabled={isSubmitting}
                  key={role}
                  onPress={() => {
                    const nextRoles = checked
                      ? field.value.filter((selectedRole) => selectedRole !== role)
                      : [...field.value, role];
                    field.onChange(nextRoles);
                  }}
                  style={[styles.roleOption, checked && styles.selectedRole]}
                >
                  <View style={[styles.checkmark, checked && styles.selectedCheckmark]}>
                    {checked ? (
                      <AppIcon color="textInverse" name="check" size={sizes.iconSm} />
                    ) : null}
                  </View>
                  <AppIcon color={checked ? 'positive' : 'textSecondary'} name={ROLE_ICONS[role]} />
                  <View style={styles.roleCopy}>
                    <AppText variant="label">{roleLabel(role)}</AppText>
                    <AppText color="textSecondary" variant="caption">
                      {roleDescription(role)}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {field.value.includes('admin') ? (
            <View accessibilityRole="summary" style={styles.roleHelp}>
              <AppIcon color="info" name="info" size={sizes.iconSm} />
              <AppText color="textSecondary" style={styles.roleHelpCopy} variant="caption">
                El rol Administrador permite gestionar usuarios internos y asignar roles.
              </AppText>
            </View>
          ) : null}
          <FieldError message={fieldState.error?.message} />
        </View>
      )}
    />
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
        <TextFieldController
          autoCapitalize={name === 'email' ? 'none' : 'sentences'}
          autoComplete={
            name === 'email' ? 'email' : name === 'firstName' ? 'given-name' : 'family-name'
          }
          control={control}
          disabled={isSubmitting}
          key={name}
          keyboardType={name === 'email' ? 'email-address' : 'default'}
          label={FIELD_LABELS[name]}
          name={name}
        />
      ))}
      <EditRoleSelector control={control} isSubmitting={isSubmitting} />
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppButton label="Guardar cambios" loading={isSubmitting} onPress={() => void submit()} />
    </View>
  );
}

function EditRoleSelector({
  control,
  isSubmitting,
}: {
  control: Control<UpdateUserFormInput>;
  isSubmitting: boolean;
}) {
  return (
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
                style={[styles.option, field.value === role && styles.selectedRole]}
              >
                <AppText>{roleLabel(role)}</AppText>
              </Pressable>
            ))}
          </View>
          <FieldError message={fieldState.error?.message} />
        </View>
      )}
    />
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  return message ? (
    <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
      {message}
    </AppText>
  ) : null;
}

function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textSecondary} style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  action: { flex: 1, minWidth: 160 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { gap: spacing.md },
  checkmark: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.xs,
    borderWidth: 1,
    height: sizes.iconMd,
    justifyContent: 'center',
    width: sizes.iconMd,
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
  option: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
  },
  options: { gap: spacing.xs },
  roleCopy: { flex: 1, gap: spacing.xxs },
  roleHelp: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  roleHelpCopy: { flex: 1 },
  roleOption: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    padding: spacing.sm,
  },
  selectedCheckmark: { backgroundColor: colors.positive, borderColor: colors.positive },
  selectedRole: { borderColor: colors.positive },
});
