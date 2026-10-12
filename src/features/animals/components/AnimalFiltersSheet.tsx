import { StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { FilterChip } from '@/components/patterns';
import { AppButton, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import { ANIMAL_SEX_FILTER_OPTIONS, type AnimalSexFilter } from '../utils/animalListPresentation';

export interface AnimalFiltersSheetProps {
  onApply(): void;
  onChangeSex(sex: AnimalSexFilter): void;
  onChangeSpecies(value: string): void;
  onClear(): void;
  onClose(): void;
  sex: AnimalSexFilter;
  species: string;
  visible: boolean;
}

/**
 * Advanced filters sheet for the animals listing (D37 / RFG-170).
 *
 * The backend publishes no species catalog, so species stays free text; sex
 * uses radio semantics. Draft values live in the parent screen and only reach
 * the query on apply, keeping the header compact on narrow viewports.
 */
export function AnimalFiltersSheet({
  onApply,
  onChangeSex,
  onChangeSpecies,
  onClear,
  onClose,
  sex,
  species,
  visible,
}: AnimalFiltersSheetProps) {
  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtros de animales"
      onClose={onClose}
      testID="animals-filter-sheet"
      title="Filtrar animales"
      visible={visible}
    >
      <View style={styles.field}>
        <AppText variant="label">Especie</AppText>
        <TextInput
          accessibilityLabel="Buscar por especie"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeSpecies}
          onSubmitEditing={onApply}
          placeholder="Ej.: dog"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="next"
          style={styles.input}
          testID="animals-filter-species"
          value={species}
        />
      </View>
      <View style={styles.field}>
        <AppText variant="label">Sexo</AppText>
        <View
          accessibilityLabel="Filtrar por sexo"
          accessibilityRole="radiogroup"
          style={styles.sexOptions}
        >
          {ANIMAL_SEX_FILTER_OPTIONS.map((option) => (
            <FilterChip
              accessibilityRole="radio"
              key={option.id}
              label={option.label}
              onPress={() => onChangeSex(option.id)}
              selected={sex === option.id}
              testID={`animals-filter-sex-${option.id}`}
            />
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <AppButton
          label="Limpiar"
          onPress={onClear}
          testID="animals-filter-clear"
          variant="ghost"
        />
        <AppButton label="Aplicar" onPress={onApply} testID="animals-filter-apply" />
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
  sexOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
