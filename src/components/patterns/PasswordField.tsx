import { useState, type ComponentProps, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { AppIcon, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

export type PasswordFieldProps = ComponentProps<typeof TextInput> & {
  label: string;
  ref?: Ref<TextInputType>;
};

/** Password input with a shared, accessible visibility toggle. */
export function PasswordField({ label, ref, style, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.inputWrapper}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          placeholderTextColor={colors.textSecondary}
          ref={ref}
          secureTextEntry={!visible}
          style={[styles.input, style]}
          {...props}
        />
        <Pressable
          accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          accessibilityRole="button"
          hitSlop={sizes.hitSlop}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
          testID={`${label.replace(/\s+/g, '-').toLowerCase()}-visibility-toggle`}
        >
          <AppIcon color="textSecondary" name={visible ? 'eyeOff' : 'eye'} size={sizes.iconMd} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
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
    paddingRight: sizes.touchTarget + spacing.xs,
    paddingVertical: spacing.sm,
  },
  inputWrapper: { justifyContent: 'center' },
  toggle: {
    alignItems: 'center',
    height: sizes.touchTarget,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    width: sizes.touchTarget,
  },
});
