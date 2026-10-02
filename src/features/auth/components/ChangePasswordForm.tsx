import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

import { validateNewPassword } from '../utils/passwordValidation';
import { PasswordField } from './PasswordField';

export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordFormProps {
  errorMessage?: string | null;
  onSubmit(values: ChangePasswordValues): Promise<void>;
}

export function ChangePasswordForm({ errorMessage, onSubmit }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);

  async function handleSubmit(): Promise<void> {
    if (currentPassword.length === 0) {
      setValidationMessage('Ingresá tu contraseña actual.');
      return;
    }

    const validation = validateNewPassword(newPassword, confirmation);
    if (!validation.ok) {
      setValidationMessage(validation.message);
      return;
    }

    setValidationMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ currentPassword, newPassword });
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleError = validationMessage ?? errorMessage;

  return (
    <View style={styles.form} testID="change-password-form">
      <PasswordField
        autoComplete="current-password"
        editable={!isSubmitting}
        label="Contraseña actual"
        onChangeText={setCurrentPassword}
        onSubmitEditing={() => newPasswordRef.current?.focus()}
        placeholder="Tu contraseña actual"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="next"
        testID="change-password-current"
        value={currentPassword}
      />
      <PasswordField
        autoComplete="new-password"
        editable={!isSubmitting}
        label="Contraseña nueva"
        onChangeText={setNewPassword}
        onSubmitEditing={() => confirmationRef.current?.focus()}
        placeholder="Mínimo 12 caracteres"
        placeholderTextColor={colors.textSecondary}
        ref={newPasswordRef}
        returnKeyType="next"
        testID="change-password-new"
        value={newPassword}
      />
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
        testID="change-password-confirmation"
        value={confirmation}
      />
      {visibleError ? (
        <AppText
          accessibilityLiveRegion="polite"
          color="danger"
          role="alert"
          testID="change-password-error"
        >
          {visibleError}
        </AppText>
      ) : null}
      <AppButton
        label="Cambiar contraseña"
        loading={isSubmitting}
        onPress={() => void handleSubmit()}
        testID="change-password-submit"
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
