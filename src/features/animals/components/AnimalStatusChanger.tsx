import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import type { AnimalStatus } from '../types';
import {
  getAllowedTransitions,
  getStatusConsequence,
  getStatusLabel,
} from '../utils/animalTransitions';

import { StatusConfirmDialog } from './StatusConfirmDialog';

interface AnimalStatusChangerProps {
  currentStatus: AnimalStatus;
  disabled?: boolean;
  errorMessage?: string | null;
  submitting?: boolean;
  onConfirm(status: AnimalStatus): void;
}

export function AnimalStatusChanger({
  currentStatus,
  disabled = false,
  errorMessage,
  onConfirm,
  submitting = false,
}: AnimalStatusChangerProps) {
  const [pending, setPending] = useState<AnimalStatus | null>(null);
  const allowed = getAllowedTransitions(currentStatus);
  const busy = disabled || submitting;

  function handleSelect(status: AnimalStatus): void {
    if (busy) {
      return;
    }
    setPending(status);
  }

  function handleConfirm(): void {
    if (pending === null) {
      return;
    }
    const target = pending;
    setPending(null);
    onConfirm(target);
  }

  return (
    <View style={styles.container}>
      {allowed.length === 0 ? (
        <AppText color="textSecondary">
          El estado actual (“{getStatusLabel(currentStatus)}”) es final y no admite cambios.
        </AppText>
      ) : (
        <>
          <AppText color="textSecondary" variant="caption">
            Estado actual: {getStatusLabel(currentStatus)}
          </AppText>
          <View accessibilityRole="radiogroup" style={styles.options}>
            {allowed.map((status) => (
              <StatusOption
                disabled={busy}
                key={status}
                label={getStatusLabel(status)}
                onPress={() => handleSelect(status)}
                selected={pending === status}
              />
            ))}
          </View>
          {pending !== null ? (
            <StatusConfirmDialog
              consequence={getStatusConsequence(pending)}
              label={getStatusLabel(pending)}
              onCancel={() => setPending(null)}
              onConfirm={handleConfirm}
              submitting={submitting}
              visible
            />
          ) : null}
        </>
      )}
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
    </View>
  );
}

function StatusOption({
  disabled,
  label,
  onPress,
  selected,
}: {
  disabled: boolean;
  label: string;
  onPress(): void;
  selected: boolean;
}) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <AppText color={selected ? 'textPrimary' : 'textSecondary'} variant="label">
        {label}
      </AppText>
      <Pressable
        accessibilityLabel={`Cambiar estado a ${label}`}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={styles.optionButton}
      >
        <AppText variant="button">Cambiar</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.md,
  },
  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.positive,
  },
  options: {
    gap: spacing.xs,
  },
});
