import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

import { validateNewPassword } from '../utils/passwordValidation';
import { PasswordField } from './PasswordField';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface ResetPasswordFormProps {
  errorMessage?: string | null;
  onSubmit(newPassword: string): Promise<void>;
}

export function ResetPasswordForm({ errorMessage, onSubmit }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const confirmationRef = useRef<TextInput>(null);

  async function handleSubmit(): Promise<void> {
    const validation = validateNewPassword(newPassword, confirmation);
    if (!validation.ok) {
      setValidationMessage(validation.message);
      return;
    }

    setValidationMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit(newPassword);
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleError = validationMessage ?? errorMessage;

  return (
    <View style={styles.form} testID="reset-password-form">
      <PasswordField
        autoComplete="new-password"
        editable={!isSubmitting}
        label="Contraseña nueva"
        onChangeText={setNewPassword}
        onSubmitEditing={() => confirmationRef.current?.focus()}
        placeholder="Mínimo 12 caracteres"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="next"
        testID="reset-password-new"
        textContentType="newPassword"
        value={newPassword}
      />
      <PasswordStrengthMeter password={newPassword} />
      <PasswordField
        autoComplete="new-password"
        editable={!isSubmitting}
        label="Confirmar contraseña nueva"
        onChangeText={setConfirmation}
        onSubmitEditing={() => void handleSubmit()}
        placeholder="Repetí la contraseña nueva"
        placeholderTextColor={colors.textSecondary}
        ref={confirmationRef}
        returnKeyType="done"
        testID="reset-password-confirmation"
        textContentType="newPassword"
        value={confirmation}
      />
      {visibleError ? (
        <AppText
          accessibilityLiveRegion="polite"
          color="danger"
          role="alert"
          testID="reset-password-error"
        >
          {visibleError}
        </AppText>
      ) : null}
      <AppButton
        label="Definir nueva contraseña"
        loading={isSubmitting}
        onPress={() => void handleSubmit()}
        testID="reset-password-submit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
    width: '100%',
  },
});
