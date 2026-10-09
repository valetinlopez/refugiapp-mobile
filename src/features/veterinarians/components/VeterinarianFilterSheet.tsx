import { StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { AppButton, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

export interface VeterinarianFilterSheetProps {
  licenseNumber: string;
  name: string;
  onApply(): void;
  onChangeLicenseNumber(value: string): void;
  onChangeName(value: string): void;
  onClear(): void;
  onClose(): void;
  visible: boolean;
}

/**
 * Advanced search sheet for the veterinarian listing. The backend combines
 * `name` and `licenseNumber` in AND, so this is the only place where both can
 * be sent at once. It re-expands the two fields of the visual reference into a
 * single accessible surface to keep the header compact. The draft values live
 * in the parent screen, so opening it always reflects the applied filters
 * without syncing state inside an effect.
 */
export function VeterinarianFilterSheet({
  licenseNumber,
  name,
  onApply,
  onChangeLicenseNumber,
  onChangeName,
  onClear,
  onClose,
  visible,
}: VeterinarianFilterSheetProps) {
  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtros de veterinarios"
      onClose={onClose}
      testID="veterinarians-filter-sheet"
      title="Filtrar veterinarios"
      visible={visible}
    >
      <View style={styles.field}>
        <AppText variant="label">Nombre</AppText>
        <TextInput
          accessibilityLabel="Buscar por nombre"
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={onChangeName}
          onSubmitEditing={onApply}
          placeholder="Ej.: Sofía Romero"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="next"
          style={styles.input}
          testID="veterinarians-filter-name"
          value={name}
        />
      </View>
      <View style={styles.field}>
        <AppText variant="label">Matrícula</AppText>
        <TextInput
          accessibilityLabel="Buscar por matrícula"
          autoCapitalize="characters"
          autoCorrect={false}
          onChangeText={onChangeLicenseNumber}
          onSubmitEditing={onApply}
          placeholder="Ej.: VET-001"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          style={styles.input}
          testID="veterinarians-filter-license"
          value={licenseNumber}
        />
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Limpiar"
          onPress={onClear}
          testID="veterinarians-filter-clear"
          variant="ghost"
        />
        <AppButton label="Aplicar" onPress={onApply} testID="veterinarians-filter-apply" />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  field: { gap: spacing.xxs },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.md,
  },
});
