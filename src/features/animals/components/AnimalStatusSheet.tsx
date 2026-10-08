import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { AppBadge, AppButton, AppIcon, AppText } from '@/components/primitives';
import { DateTimeField } from '@/components/patterns';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import type { AnimalStatus } from '../types';
import {
  getAllowedTransitions,
  getStatusBadge,
  getStatusDescription,
  getStatusLabel,
} from '../utils/animalTransitions';
import {
  STATUS_CHANGE_FUTURE_TOLERANCE_MS,
  isValidStatusChangeOccurredAt,
} from '../utils/statusChangeOccurredAt';

export interface AnimalStatusSheetProps {
  animalName: string;
  currentStatus: AnimalStatus;
  errorMessage?: string | null;
  onClose(): void;
  onConfirm(status: AnimalStatus, occurredAt?: string): void;
  submitting?: boolean;
  visible: boolean;
}

/**
 * Sheet de cambio de estado (D14 / RFG-147).
 *
 * Only offers the transitions allowed by the local `animalTransitions` matrix;
 * the backend remains the authority and a `409` is handled by the feature. The
 * optional `occurredAt` reuses the shared `DateTimeField` (empty = backend
 * records the current time) with the 60 second future skew tolerance.
 */
export function AnimalStatusSheet({
  animalName,
  currentStatus,
  errorMessage,
  onClose,
  onConfirm,
  submitting = false,
  visible,
}: AnimalStatusSheetProps) {
  const [selected, setSelected] = useState<AnimalStatus | null>(null);
  const [occurredAt, setOccurredAt] = useState('');
  const [occurredAtError, setOccurredAtError] = useState<string | null>(null);

  const allowed = getAllowedTransitions(currentStatus);
  const currentBadge = getStatusBadge(currentStatus);
  const [maximumOccurredAt] = useState(
    () => new Date(Date.now() + STATUS_CHANGE_FUTURE_TOLERANCE_MS)
  );

  function reset(): void {
    setSelected(null);
    setOccurredAt('');
    setOccurredAtError(null);
  }

  function handleClose(): void {
    reset();
    onClose();
  }

  function handleConfirm(): void {
    if (selected === null || submitting) {
      return;
    }
    if (!isValidStatusChangeOccurredAt(occurredAt)) {
      setOccurredAtError('La fecha y hora no puede estar en el futuro.');
      return;
    }
    const target = selected;
    const value = occurredAt === '' ? undefined : occurredAt;
    reset();
    onConfirm(target, value);
  }

  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar el selector de estado"
      onClose={handleClose}
      testID="status-sheet"
      title="Cambiar estado"
      visible={visible}
    >
      <View style={styles.current}>
        <AppText color="textSecondary" variant="label">
          Estado actual
        </AppText>
        <AppBadge icon={currentBadge.icon} label={currentBadge.label} tone={currentBadge.tone} />
      </View>

      {allowed.length === 0 ? (
        <AppText color="textSecondary">
          El estado actual (“{getStatusLabel(currentStatus)}”) es final y no admite cambios.
        </AppText>
      ) : (
        <>
          <AppText color="textSecondary">Seleccioná el nuevo estado de {animalName}.</AppText>
          <View accessibilityRole="radiogroup" style={styles.options}>
            {allowed.map((status) => (
              <StatusOption
                disabled={submitting}
                key={status}
                onPress={() => setSelected(status)}
                selected={selected === status}
                status={status}
              />
            ))}
          </View>
        </>
      )}

      <View style={styles.dateField}>
        <AppText variant="bodyStrong">Fecha y hora del cambio (opcional)</AppText>
        <DateTimeField
          accessibilityLabel="Fecha y hora del cambio"
          accessibilityHint="Por defecto se registra el momento actual"
          disabled={submitting}
          maximumDate={maximumOccurredAt}
          mode="datetime"
          onChange={(value) => {
            setOccurredAt(value);
            setOccurredAtError(null);
          }}
          optional
          value={occurredAt}
        />
        <AppText color="textSecondary" variant="caption">
          Si no elegís una, se registra el momento actual.
        </AppText>
        {occurredAtError ? (
          <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
            {occurredAtError}
          </AppText>
        ) : null}
      </View>

      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}

      <View style={styles.footer}>
        <AppButton
          disabled={submitting}
          label="Cancelar"
          onPress={handleClose}
          testID="status-cancel"
          variant="ghost"
        />
        <AppButton
          disabled={selected === null}
          label="Confirmar cambio"
          loading={submitting}
          onPress={handleConfirm}
          testID="status-confirm"
        />
      </View>
    </BottomSheet>
  );
}

function StatusOption({
  disabled,
  onPress,
  selected,
  status,
}: {
  disabled: boolean;
  onPress(): void;
  selected: boolean;
  status: AnimalStatus;
}) {
  const badge = getStatusBadge(status);
  const description = getStatusDescription(status);
  const toneColor = badge.tone === 'default' ? 'textPrimary' : badge.tone;

  return (
    <Pressable
      accessibilityLabel={`${badge.label}. ${description}`}
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
      testID={`status-option-${status}`}
    >
      <View style={styles.optionIcon}>
        <AppIcon color={toneColor} name={badge.icon} size={sizes.iconMd} />
      </View>
      <View style={styles.optionText}>
        <AppText variant="bodyStrong">{badge.label}</AppText>
        <AppText color="textSecondary" variant="caption">
          {description}
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
  current: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  dateField: {
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
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
  optionIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  optionPressed: {
    opacity: opacity.pressedSubtle,
  },
  optionSelected: {
    borderColor: colors.positive,
  },
  optionText: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  options: {
    gap: spacing.xs,
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
});
