import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppIcon, AppText } from '@/components/primitives';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import type { VeterinarianOption, VeterinariansStatus } from '../types';

export interface VeterinarianRecordFieldProps {
  disabled: boolean;
  onChange(value: string): void;
  onRetry?(): void;
  options: VeterinarianOption[];
  status: VeterinariansStatus;
  value: string;
}

/**
 * Optional veterinarian selector for the clinical create form (D26).
 *
 * Mirrors the existing "save without veterinarian" rule: the trigger is always
 * usable, and a failed or empty `GET /veterinarians` renders a recoverable
 * inline state with retry instead of blocking the form. A selected veterinarian
 * can be cleared from the trigger with a 44 x 44 control.
 */
export function VeterinarianRecordField({
  disabled,
  onChange,
  onRetry,
  options,
  status,
  value,
}: VeterinarianRecordFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={
            selected ? 'Veterinario: ' + selected.name : 'Seleccionar veterinario (opcional)'
          }
          accessibilityRole="button"
          accessibilityState={{ disabled, expanded: open }}
          disabled={disabled}
          hitSlop={sizes.hitSlop}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
          testID="clinical-veterinarian-field"
        >
          <View style={styles.selectorIcon}>
            <AppIcon color="positive" name="account" />
          </View>
          <View style={styles.selectorCopy}>
            <AppText color={selected ? 'textPrimary' : 'textSecondary'}>
              {selected?.name ?? 'Sin veterinario'}
            </AppText>
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {selected?.licenseNumber ?? 'Tocá para elegir un veterinario'}
            </AppText>
          </View>
        </Pressable>
        {selected !== undefined ? (
          <Pressable
            accessibilityLabel={'Quitar veterinario ' + selected.name}
            accessibilityRole="button"
            disabled={disabled}
            hitSlop={sizes.hitSlop}
            onPress={() => onChange('')}
            style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
            testID="clinical-veterinarian-clear"
          >
            <AppIcon color="textSecondary" name="close" />
          </Pressable>
        ) : null}
      </View>

      {status === 'loading' ? <LoadingState label="Cargando veterinarios" /> : null}
      {status === 'error' ? (
        <ErrorState
          actionLabel="Reintentar"
          message="No pudimos cargar los veterinarios. Podés continuar sin veterinario."
          {...(onRetry ? { onAction: onRetry } : {})}
          title="No se pudieron cargar los veterinarios"
        />
      ) : null}
      {status === 'empty' ? (
        <EmptyState
          actionLabel="Reintentar"
          message="No hay veterinarios activos. Podés guardar el registro sin veterinario."
          {...(onRetry ? { onAction: onRetry } : {})}
          title="Sin veterinarios activos"
        />
      ) : null}

      <BottomSheet
        closeAccessibilityLabel="Cerrar selección de veterinario"
        onClose={() => setOpen(false)}
        testID="clinical-veterinarian-field-sheet"
        title="Seleccionar veterinario"
        visible={open}
      >
        <View
          accessibilityLabel="Veterinarios"
          accessibilityRole="radiogroup"
          style={styles.options}
        >
          <Pressable
            accessibilityLabel="Sin veterinario"
            accessibilityRole="radio"
            accessibilityState={{ checked: value === '', disabled }}
            disabled={disabled}
            hitSlop={sizes.hitSlop}
            onPress={() => {
              onChange('');
              setOpen(false);
            }}
            style={[styles.option, value === '' && styles.optionSelected]}
            testID="clinical-veterinarian-option-none"
          >
            <AppText style={styles.optionLabel} variant={value === '' ? 'bodyStrong' : 'body'}>
              Sin veterinario
            </AppText>
            {value === '' ? <AppIcon color="positive" name="check" /> : null}
          </Pressable>
          {options.map((option) => {
            const selectedOption = option.id === value;
            return (
              <Pressable
                accessibilityLabel={option.name}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedOption, disabled }}
                disabled={disabled}
                hitSlop={sizes.hitSlop}
                key={option.id}
                onPress={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                style={[styles.option, selectedOption && styles.optionSelected]}
                testID={`clinical-veterinarian-option-${option.id}`}
              >
                <View style={styles.optionCopy}>
                  <AppText variant={selectedOption ? 'bodyStrong' : 'body'}>{option.name}</AppText>
                  <AppText color="textSecondary" variant="caption">
                    {option.licenseNumber}
                  </AppText>
                </View>
                {selectedOption ? <AppIcon color="positive" name="check" /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  clear: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
    minWidth: sizes.buttonHeight,
  },
  container: { gap: spacing.xs },
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
  optionCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  optionLabel: { flex: 1 },
  optionSelected: { borderColor: colors.positive },
  options: { gap: spacing.xs },
  pressed: { opacity: opacity.pressedSubtle },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  selector: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
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
