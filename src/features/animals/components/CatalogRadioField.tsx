import { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppIcon, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import {
  isKnownCatalogValue,
  OTHER_OPTION_VALUE,
  type CatalogOption,
  type CatalogStatus,
} from '../utils/speciesCatalog';

import { FormField, FormTextInput } from './formFields';

export interface CatalogRadioFieldProps {
  disabled?: boolean;
  error: string | undefined;
  label: string;
  maxLength: number;
  onChange(value: string): void;
  onLayout?: (event: LayoutChangeEvent) => void;
  onRetry?: () => void;
  options: CatalogOption[];
  optional?: boolean;
  placeholder?: string;
  status: CatalogStatus;
  textAccessibilityLabel: string;
  textPlaceholder?: string;
  value: string | undefined;
}

export function CatalogRadioField({
  disabled = false,
  error,
  label,
  maxLength,
  onChange,
  onLayout,
  onRetry,
  options,
  optional = false,
  placeholder,
  status,
  textAccessibilityLabel,
  textPlaceholder,
  value,
}: CatalogRadioFieldProps) {
  const [otherIntent, setOtherIntent] = useState(false);

  const isOther =
    otherIntent || (value !== undefined && value !== '' && !isKnownCatalogValue(value, options));

  function handleSelect(selected: string): void {
    if (selected === OTHER_OPTION_VALUE) {
      setOtherIntent(true);
      onChange('');
      return;
    }
    setOtherIntent(false);
    onChange(selected);
  }

  const allOptions: CatalogOption[] = [
    ...options,
    { label: 'Otra', value: OTHER_OPTION_VALUE },
    ...(optional ? [{ label: 'Sin raza', value: '' }] : []),
  ];

  const selectedValue = isOther ? OTHER_OPTION_VALUE : value;

  const freeTextInput = (
    <FormTextInput
      accessibilityLabel={textAccessibilityLabel}
      autoCapitalize="words"
      autoComplete="off"
      editable={!disabled}
      maxLength={maxLength}
      onChangeText={onChange}
      placeholder={textPlaceholder}
      value={value ?? ''}
    />
  );

  return (
    <FormField error={error} label={label} {...(onLayout ? { onLayout } : {})}>
      {status === 'loading' ? <LoadingState label={`Cargando ${label.toLowerCase()}`} /> : null}
      {status === 'error' ? (
        <View style={styles.fallback}>
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar el catálogo. Podés reintentar o escribir el valor a mano."
            {...(onRetry ? { onAction: onRetry } : {})}
            title="No se pudo cargar el catálogo"
          />
          {freeTextInput}
        </View>
      ) : null}
      {status === 'empty' ? (
        <View style={styles.fallback}>
          <EmptyState
            actionLabel="Reintentar"
            message="El catálogo no tiene opciones. Podés escribir el valor a mano."
            {...(onRetry ? { onAction: onRetry } : {})}
            title="Catálogo sin opciones"
          />
          {freeTextInput}
        </View>
      ) : null}
      {status === 'ready' ? (
        <View accessibilityLabel={label} accessibilityRole="radiogroup" style={styles.options}>
          {allOptions.map((option) => {
            const selected = option.value === selectedValue;
            return (
              <Pressable
                key={option.value}
                accessibilityLabel={option.label}
                accessibilityRole="radio"
                accessibilityState={{ disabled, selected }}
                disabled={disabled}
                onPress={() => handleSelect(option.value)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                {selected ? <AppIcon color="positive" name="check" size={sizes.iconSm} /> : null}
                <AppText color={selected ? 'textPrimary' : 'textSecondary'} variant="label">
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {status === 'ready' && isOther ? freeTextInput : null}
    </FormField>
  );
}

const styles = StyleSheet.create({
  fallback: {
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  optionSelected: {
    borderColor: colors.positive,
  },
  options: {
    gap: spacing.xs,
  },
});
