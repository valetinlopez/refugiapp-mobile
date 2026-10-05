import { router, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInput as TextInputType } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, spacing } from '@/theme';

import type { LoginRequest } from '../types';

interface LoginFormProps {
  errorMessage?: string | null;
  onSubmit(credentials: LoginRequest): Promise<void>;
}

export function LoginForm({ errorMessage, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const passwordRef = useRef<TextInputType>(null);

  async function handleSubmit(): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || password.length < 12) {
      setValidationMessage('Ingresa un correo válido y una contraseña de al menos 12 caracteres.');
      return;
    }

    setValidationMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ email: normalizedEmail, password });
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleError = validationMessage ?? errorMessage;

  return (
    <View style={styles.form} testID="login-form">
      <View style={styles.field}>
        <AppText variant="label">Correo electrónico</AppText>
        <TextInput
          accessibilityLabel="Correo electrónico"
          autoCapitalize="none"
          autoComplete="email"
          blurOnSubmit={false}
          editable={!isSubmitting}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          onSubmitEditing={() => passwordRef.current?.focus()}
          placeholder="nombre@refugiapp.org"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="next"
          style={styles.input}
          testID="login-email"
          value={email}
        />
      </View>
      <View style={styles.field}>
        <AppText variant="label">Contraseña</AppText>
        <TextInput
          accessibilityLabel="Contraseña"
          autoCapitalize="none"
          autoComplete="current-password"
          editable={!isSubmitting}
          onChangeText={setPassword}
          onSubmitEditing={() => void handleSubmit()}
          placeholder="Tu contraseña"
          placeholderTextColor={colors.textSecondary}
          ref={passwordRef}
          returnKeyType="done"
          secureTextEntry
          style={styles.input}
          testID="login-password"
          textContentType="password"
          value={password}
        />
      </View>
      {visibleError ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert" testID="login-error">
          {visibleError}
        </AppText>
      ) : null}
      <AppButton
        label="Iniciar sesión"
        loading={isSubmitting}
        onPress={() => void handleSubmit()}
        testID="login-submit"
      />
      <AppButton
        accessibilityHint="Abrir recuperación de contraseña"
        label="Olvidé mi contraseña"
        onPress={() => router.push('/forgot-password' as Href)}
        testID="login-forgot-password"
        variant="ghost"
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
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
