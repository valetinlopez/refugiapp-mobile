import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, spacing } from '@/theme';

import { isValidEmail, normalizeEmail } from '../utils/passwordValidation';

interface RequestPasswordResetFormProps {
  errorMessage?: string | null;
  onSubmit(email: string): Promise<void>;
}

export function RequestPasswordResetForm({
  errorMessage,
  onSubmit,
}: RequestPasswordResetFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      setValidationMessage('Ingresá un correo válido.');
      return;
    }

    setValidationMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit(normalizedEmail);
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleError = validationMessage ?? errorMessage;

  return (
    <View style={styles.form} testID="request-password-reset-form">
      <View style={styles.field}>
        <AppText variant="label">Correo electrónico</AppText>
        <TextInput
          accessibilityLabel="Correo electrónico"
          autoCapitalize="none"
          autoComplete="email"
          editable={!isSubmitting}
          inputMode="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          onSubmitEditing={() => void handleSubmit()}
          placeholder="nombre@refugiapp.org"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          style={styles.input}
          testID="request-password-reset-email"
          value={email}
        />
      </View>
      {visibleError ? (
        <AppText
          accessibilityLiveRegion="polite"
          color="danger"
          role="alert"
          testID="request-password-reset-error"
        >
          {visibleError}
        </AppText>
      ) : null}
      <AppButton
        label="Enviar enlace de recuperación"
        loading={isSubmitting}
        onPress={() => void handleSubmit()}
        testID="request-password-reset-submit"
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
