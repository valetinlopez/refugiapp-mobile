import type { ComponentProps, Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInput as TextInputType } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, spacing } from '@/theme';

type PasswordFieldProps = ComponentProps<typeof TextInput> & {
  label: string;
  ref?: Ref<TextInputType>;
};

export function PasswordField({ label, ref, style, ...props }: PasswordFieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        ref={ref}
        secureTextEntry
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
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
