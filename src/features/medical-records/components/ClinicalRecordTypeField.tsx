import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { AppIcon, AppText } from '@/components/primitives';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import type { MedicalRecordType } from '../types';
import { getRecordTypeLabel, RECORD_TYPE_OPTIONS } from '../utils/medicalRecordPresentation';

export interface ClinicalRecordTypeFieldProps {
  disabled: boolean;
  onChange(value: MedicalRecordType): void;
  value: MedicalRecordType;
}

/**
 * Record type selector for the clinical create form (D26).
 *
 * Editorial trigger row that opens a `BottomSheet` radiogroup over the seven
 * contract values, so the whole list stays reachable with large fonts instead
 * of a cramped inline option group. The parent renders the field label.
 */
export function ClinicalRecordTypeField({
  disabled,
  onChange,
  value,
}: ClinicalRecordTypeFieldProps) {
  const [open, setOpen] = useState(false);
  const label = getRecordTypeLabel(value);

  return (
    <>
      <Pressable
        accessibilityLabel={'Tipo de registro: ' + label}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        hitSlop={sizes.hitSlop}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
        testID="clinical-type-field"
      >
        <View style={styles.selectorIcon}>
          <AppIcon color="positive" name="medical" />
        </View>
        <View style={styles.selectorCopy}>
          <AppText>{label}</AppText>
          <AppText color="textSecondary" variant="caption">
            Tocá para cambiar el tipo
          </AppText>
        </View>
        <AppIcon color="textSecondary" name="chevronRight" />
      </Pressable>

      <BottomSheet
        closeAccessibilityLabel="Cerrar selección de tipo"
        onClose={() => setOpen(false)}
        testID="clinical-type-field-sheet"
        title="Seleccionar tipo"
        visible={open}
      >
        <View
          accessibilityLabel="Tipos de registro"
          accessibilityRole="radiogroup"
          style={styles.options}
        >
          {RECORD_TYPE_OPTIONS.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled }}
                disabled={disabled}
                hitSlop={sizes.hitSlop}
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={[styles.option, selected && styles.optionSelected]}
                testID={`clinical-type-option-${option.value}`}
              >
                <AppText style={styles.optionLabel} variant={selected ? 'bodyStrong' : 'body'}>
                  {option.label}
                </AppText>
                {selected ? <AppIcon color="positive" name="check" /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
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
  optionLabel: { flex: 1 },
  optionSelected: { borderColor: colors.positive },
  options: { gap: spacing.xs },
  pressed: { opacity: opacity.pressedSubtle },
  selector: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.buttonHeight,
    padding: spacing.sm,
  },
  selectorCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  selectorIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    height: sizes.avatarMd,
    justifyContent: 'center',
    width: sizes.avatarMd,
  },
});
