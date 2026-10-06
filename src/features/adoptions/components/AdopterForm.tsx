import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useRef, type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInput as TextInputType } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import {
  adopterSchema,
  type AdopterFormInput,
  type AdopterFormValues,
} from '../utils/adoptionSchema';

export function AdopterForm({
  errorMessage,
  isSubmitting,
  onSubmit,
}: {
  errorMessage?: string | null;
  isSubmitting: boolean;
  onSubmit(values: AdopterFormValues): void;
}) {
  const lastNameRef = useRef<TextInputType>(null);
  const emailRef = useRef<TextInputType>(null);
  const phoneRef = useRef<TextInputType>(null);
  const addressRef = useRef<TextInputType>(null);
  const { control, handleSubmit } = useForm<AdopterFormInput, unknown, AdopterFormValues>({
    resolver: zodResolver(adopterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  return (
    <View style={styles.form}>
      <ControlledInput
        accessibilityLabel="Nombre del adoptante"
        autoCapitalize="words"
        control={control}
        editable={!isSubmitting}
        label="Nombre"
        name="firstName"
        onSubmitEditing={() => lastNameRef.current?.focus()}
        placeholder="Ana"
        returnKeyType="next"
      />
      <ControlledInput
        accessibilityLabel="Apellido del adoptante"
        autoCapitalize="words"
        control={control}
        editable={!isSubmitting}
        inputRef={lastNameRef}
        label="Apellido"
        name="lastName"
        onSubmitEditing={() => emailRef.current?.focus()}
        placeholder="Pérez"
        returnKeyType="next"
      />
      <ControlledInput
        accessibilityLabel="Email del adoptante"
        autoCapitalize="none"
        autoComplete="email"
        control={control}
        editable={!isSubmitting}
        inputRef={emailRef}
        keyboardType="email-address"
        label="Email"
        name="email"
        onSubmitEditing={() => phoneRef.current?.focus()}
        placeholder="ana@ejemplo.com"
        returnKeyType="next"
      />
      <ControlledInput
        accessibilityHint="Incluí código de país y área"
        accessibilityLabel="Teléfono del adoptante"
        autoComplete="tel"
        control={control}
        editable={!isSubmitting}
        inputRef={phoneRef}
        keyboardType="phone-pad"
        label="Teléfono internacional"
        name="phone"
        onSubmitEditing={() => addressRef.current?.focus()}
        placeholder="+5491123456789"
        returnKeyType="next"
      />
      <ControlledInput
        accessibilityLabel="Domicilio del adoptante"
        autoCapitalize="sentences"
        control={control}
        editable={!isSubmitting}
        inputRef={addressRef}
        label="Domicilio (opcional)"
        name="address"
        placeholder="Calle 123"
        returnKeyType="done"
      />
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
      <AppText color="textSecondary" variant="caption">
        Los datos personales se usan únicamente para gestionar la postulación y no se incluyen en el
        historial visible para veterinarios.
      </AppText>
      <AppButton
        label="Registrar postulación"
        loading={isSubmitting}
        onPress={() => void handleSubmit(onSubmit)()}
      />
    </View>
  );
}

function ControlledInput({
  control,
  inputRef,
  label,
  name,
  ...props
}: Omit<ComponentProps<typeof TextInput>, 'onBlur' | 'onChangeText' | 'value'> & {
  control: ReturnType<typeof useForm<AdopterFormInput, unknown, AdopterFormValues>>['control'];
  inputRef?: React.Ref<TextInput>;
  label: string;
  name: keyof AdopterFormInput;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field error={fieldState.error?.message} label={label}>
          <TextInput
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholderTextColor={colors.textSecondary}
            ref={inputRef}
            style={styles.input}
            value={field.value ?? ''}
            {...props}
          />
        </Field>
      )}
    />
  );
}

function Field({
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
});
