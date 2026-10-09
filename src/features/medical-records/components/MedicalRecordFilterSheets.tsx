import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { DateTimeField } from '@/components/patterns';
import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import type { MedicalRecordType } from '../types';
import {
  getClinicalDatePresetRange,
  isValidClinicalDateRange,
  type ClinicalDatePreset,
  type ClinicalDateRange,
} from '../utils/globalClinicalFilters';
import { getRecordTypeLabel } from '../utils/medicalRecordPresentation';
import { MEDICAL_RECORD_TYPE_VALUES } from '../utils/medicalRecordSchema';

const DATE_PRESETS: readonly { id: Exclude<ClinicalDatePreset, 'custom'>; label: string }[] = [
  { id: 'last7', label: 'Últimos 7 días' },
  { id: 'last30', label: 'Últimos 30 días' },
  { id: 'thisMonth', label: 'Este mes' },
];

export interface ClinicalAnimalFilterOption {
  id: string;
  name: string;
}

interface FilterOptionProps {
  label: string;
  onPress(): void;
  selected: boolean;
  testID?: string | undefined;
}

function FilterOption({ label, onPress, selected, testID }: FilterOptionProps) {
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

export function ClinicalAnimalFilterSheet({
  animals,
  onClose,
  onSelect,
  selectedAnimalId,
  visible,
}: {
  animals: readonly ClinicalAnimalFilterOption[];
  onClose(): void;
  onSelect(animalId: string | undefined): void;
  selectedAnimalId: string | undefined;
  visible: boolean;
}) {
  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtro de animales"
      onClose={onClose}
      testID="clinical-animal-filter-sheet"
      title="Filtrar por animal"
      visible={visible}
    >
      <View accessibilityLabel="Animales" accessibilityRole="radiogroup" style={styles.options}>
        <FilterOption
          label="Todos los animales"
          onPress={() => onSelect(undefined)}
          selected={selectedAnimalId === undefined}
          testID="clinical-animal-option-all"
        />
        {animals.map((animal) => (
          <FilterOption
            key={animal.id}
            label={animal.name}
            onPress={() => onSelect(animal.id)}
            selected={selectedAnimalId === animal.id}
            testID={`clinical-animal-option-${animal.id}`}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

export function ClinicalTypeFilterSheet({
  onClose,
  onSelect,
  selectedType,
  visible,
}: {
  onClose(): void;
  onSelect(type: MedicalRecordType | undefined): void;
  selectedType: MedicalRecordType | undefined;
  visible: boolean;
}) {
  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtro de tipos"
      onClose={onClose}
      testID="clinical-type-filter-sheet"
      title="Filtrar por tipo"
      visible={visible}
    >
      <View
        accessibilityLabel="Tipos de registro"
        accessibilityRole="radiogroup"
        style={styles.options}
      >
        <FilterOption
          label="Todos los tipos"
          onPress={() => onSelect(undefined)}
          selected={selectedType === undefined}
          testID="clinical-type-option-all"
        />
        {MEDICAL_RECORD_TYPE_VALUES.map((type) => (
          <FilterOption
            key={type}
            label={getRecordTypeLabel(type)}
            onPress={() => onSelect(type)}
            selected={selectedType === type}
            testID={`clinical-type-option-${type}`}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

export function ClinicalDateFilterSheet({
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
  onApply(range: ClinicalDateRange): void;
  onClose(): void;
  to: string;
  visible: boolean;
}) {
  const draftRange: ClinicalDateRange = {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };
  const isValid = isValidClinicalDateRange(draftRange.from, draftRange.to);
  const presetRanges = DATE_PRESETS.map((preset) => ({
    ...preset,
    range: getClinicalDatePresetRange(preset.id),
  }));

  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtro de fechas"
      onClose={onClose}
      testID="clinical-date-filter-sheet"
      title="Filtrar por fechas"
      visible={visible}
    >
      <View style={styles.options}>
        {presetRanges.map((preset) => (
          <FilterOption
            key={preset.id}
            label={preset.label}
            onPress={() => onApply(preset.range)}
            selected={from === preset.range.from && to === preset.range.to}
            testID={`clinical-date-preset-${preset.id}`}
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
          testID="clinical-date-apply"
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
