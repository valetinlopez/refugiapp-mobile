import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { DateTimeField } from '@/components/patterns';
import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import type { AnimalOption, ExpenseCategory } from '../types';
import {
  getExpenseDatePresetRange,
  isValidExpenseDateRange,
  type ExpenseDatePreset,
  type ExpenseDateRange,
} from '../utils/expenseFilters';
import { getExpenseCategoryLabel } from '../utils/expensePresentation';
import { expenseCategories } from '../utils/expenseSchema';

const DATE_PRESETS: readonly {
  id: Exclude<ExpenseDatePreset, 'custom'>;
  label: string;
}[] = [
  { id: 'last7', label: 'Últimos 7 días' },
  { id: 'last30', label: 'Últimos 30 días' },
  { id: 'thisMonth', label: 'Este mes' },
];

export function SheetOption({
  label,
  onPress,
  selected,
  testID,
}: {
  label: string;
  onPress(): void;
  selected: boolean;
  testID?: string | undefined;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      hitSlop={sizes.hitSlop}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
      testID={testID}
    >
      <AppText style={styles.optionLabel} variant={selected ? 'bodyStrong' : 'body'}>
        {label}
      </AppText>
      {selected ? <AppIcon color="positive" name="check" /> : null}
    </Pressable>
  );
}

export function ExpenseAnimalFilterSheet({
  animals,
  onClose,
  onSelect,
  selectedAnimalId,
  visible,
}: {
  animals: readonly AnimalOption[];
  onClose(): void;
  onSelect(animalId: string | undefined): void;
  selectedAnimalId: string | undefined;
  visible: boolean;
}) {
  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtro de animales"
      onClose={onClose}
      testID="expense-animal-filter-sheet"
      title="Filtrar por animal"
      visible={visible}
    >
      <View accessibilityLabel="Animales" accessibilityRole="radiogroup" style={styles.options}>
        <SheetOption
          label="Todos los animales"
          onPress={() => onSelect(undefined)}
          selected={selectedAnimalId === undefined}
        />
        {animals.map((animal) => (
          <SheetOption
            key={animal.id}
            label={animal.name}
            onPress={() => onSelect(animal.id)}
            selected={selectedAnimalId === animal.id}
            testID={`expense-animal-option-${animal.id}`}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

export function ExpenseCategoryFilterSheet({
  onClose,
  onSelect,
  selectedCategory,
  visible,
}: {
  onClose(): void;
  onSelect(category: ExpenseCategory | undefined): void;
  selectedCategory: ExpenseCategory | undefined;
  visible: boolean;
}) {
  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtro de categorías"
      onClose={onClose}
      testID="expense-category-filter-sheet"
      title="Filtrar por categoría"
      visible={visible}
    >
      <View accessibilityLabel="Categorías" accessibilityRole="radiogroup" style={styles.options}>
        <SheetOption
          label="Todas las categorías"
          onPress={() => onSelect(undefined)}
          selected={selectedCategory === undefined}
        />
        {expenseCategories.map((category) => (
          <SheetOption
            key={category}
            label={getExpenseCategoryLabel(category)}
            onPress={() => onSelect(category)}
            selected={selectedCategory === category}
            testID={`expense-category-option-${category}`}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

export function ExpenseDateFilterSheet({
  from,
  onChangeFrom,
  onChangeTo,
  onApply,
  onClose,
  to,
  visible,
}: {
  from: string;
  onChangeFrom(value: string): void;
  onChangeTo(value: string): void;
  onApply(range: ExpenseDateRange): void;
  onClose(): void;
  to: string;
  visible: boolean;
}) {
  const draftRange: ExpenseDateRange = {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };
  const isValid = isValidExpenseDateRange(draftRange.from, draftRange.to);
  const presetRanges = DATE_PRESETS.map((preset) => ({
    ...preset,
    range: getExpenseDatePresetRange(preset.id),
  }));

  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtro de fechas"
      onClose={onClose}
      testID="expense-date-filter-sheet"
      title="Filtrar por fechas"
      visible={visible}
    >
      <View style={styles.options}>
        {presetRanges.map((preset) => (
          <SheetOption
            key={preset.id}
            label={preset.label}
            onPress={() => onApply(preset.range)}
            selected={from === preset.range.from && to === preset.range.to}
            testID={`expense-date-preset-${preset.id}`}
          />
        ))}
      </View>
      <View style={styles.customRange}>
        <AppText variant="label">Rango personalizado</AppText>
        <DateTimeField
          accessibilityLabel="Desde"
          mode="date"
          onChange={onChangeFrom}
          optional
          value={from}
        />
        <DateTimeField
          accessibilityLabel="Hasta"
          mode="date"
          onChange={onChangeTo}
          optional
          value={to}
        />
        {isValid ? null : (
          <AppText color="danger" role="alert">
            La fecha desde no puede ser posterior a la fecha hasta.
          </AppText>
        )}
        <AppButton
          disabled={!isValid}
          label="Aplicar rango"
          onPress={() => onApply(draftRange)}
          testID="expense-date-apply"
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  customRange: { gap: spacing.xs },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionLabel: { flex: 1 },
  optionSelected: { borderColor: colors.positive },
  options: { gap: spacing.xs },
});
