import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { AppIcon, AppText, type AppIconName } from '@/components/primitives';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import type { ManualAnimalHistoryEventType } from '../types';

export interface AnimalEventTypeOption {
  description: string;
  icon: AppIconName;
  label: string;
  value: ManualAnimalHistoryEventType;
}

/**
 * Tipos manuales publicados por OpenAPI (`general_note`, `behavior_note`,
 * `transfer`). Los eventos de sistema (`intake`, `status_change`, `adoption`)
 * no se crean desde la UI.
 */
export const ANIMAL_EVENT_TYPE_OPTIONS: readonly AnimalEventTypeOption[] = [
  {
    value: 'general_note',
    label: 'Nota general',
    description: 'Información general, no clínica, sobre el animal.',
    icon: 'document',
  },
  {
    value: 'behavior_note',
    label: 'Nota de comportamiento',
    description: 'Observación de conducta o adaptación.',
    icon: 'paw',
  },
  {
    value: 'transfer',
    label: 'Traslado',
    description: 'Cambio de espacio, responsable o refugio.',
    icon: 'transport',
  },
];

export interface AnimalEventTypeFieldProps {
  disabled?: boolean;
  onChange(value: ManualAnimalHistoryEventType): void;
  testID?: string;
  value: ManualAnimalHistoryEventType;
}

/**
 * Selector de tipo de evento (D15 / RFG-148).
 *
 * Imita el desplegable de la referencia sin depender de un picker JS: el
 * trigger abre un `BottomSheet` del sistema con opciones tipo radio (icono,
 * etiqueta, descripción y marca de selección), de modo que el estado nunca se
 * comunica solo por color y cada opción conserva 44 × 44. El valor se sincroniza
 * con React Hook Form vía `onChange` y no reinicia el borrador.
 */
export function AnimalEventTypeField({
  disabled = false,
  onChange,
  testID = 'create-event-type-trigger',
  value,
}: AnimalEventTypeFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = ANIMAL_EVENT_TYPE_OPTIONS.find((option) => option.value === value);

  function handleSelect(next: ManualAnimalHistoryEventType): void {
    onChange(next);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        accessibilityHint="Abre el selector de tipo de evento"
        accessibilityLabel={`Tipo de evento: ${selected?.label ?? ''}`}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
        testID={testID}
      >
        <View style={styles.triggerIcon}>
          <AppIcon color="textSecondary" name={selected?.icon ?? 'document'} size={sizes.iconMd} />
        </View>
        <View style={styles.triggerCopy}>
          <AppText variant="bodyStrong">{selected?.label ?? 'Elegí un tipo'}</AppText>
        </View>
        <AppIcon color="textSecondary" name="chevronRight" size={sizes.iconMd} />
      </Pressable>

      <BottomSheet
        closeAccessibilityLabel="Cerrar el selector de tipo de evento"
        onClose={() => setOpen(false)}
        testID="create-event-type-sheet"
        title="Tipo de evento"
        visible={open}
      >
        <AppText color="textSecondary">
          Elegí el tipo que mejor describa la novedad. Los eventos clínicos se registran en la
          evolución clínica.
        </AppText>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {ANIMAL_EVENT_TYPE_OPTIONS.map((option) => (
            <EventTypeOption
              key={option.value}
              onPress={() => handleSelect(option.value)}
              option={option}
              selected={option.value === value}
            />
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

function EventTypeOption({
  onPress,
  option,
  selected,
}: {
  onPress(): void;
  option: AnimalEventTypeOption;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={`${option.label}. ${option.description}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}
      testID={`create-event-type-option-${option.value}`}
    >
      <View style={styles.optionIcon}>
        <AppIcon name={option.icon} size={sizes.iconMd} />
      </View>
      <View style={styles.optionCopy}>
        <AppText variant="bodyStrong">{option.label}</AppText>
        <AppText color="textSecondary" variant="caption">
          {option.description}
        </AppText>
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.radio, selected && styles.radioSelected]}
      >
        {selected ? <AppIcon color="textInverse" name="check" size={sizes.iconSm} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  optionCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  optionSelected: {
    borderColor: colors.positive,
  },
  options: {
    gap: spacing.xs,
  },
  pressed: {
    opacity: opacity.pressedSubtle,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 2,
    height: spacing.lg,
    justifyContent: 'center',
    width: spacing.lg,
  },
  radioSelected: {
    backgroundColor: colors.positive,
    borderColor: colors.positive,
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  triggerCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  triggerIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
});
