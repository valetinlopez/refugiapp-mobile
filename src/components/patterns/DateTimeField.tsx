import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import { formatDateTime, formatDateShort } from './dateFormat';

export interface DateTimeFieldProps {
  accessibilityHint?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
  mode: 'date' | 'datetime' | 'time';
  onChange(value: string): void;
  optional?: boolean;
  value: string;
}

function defaultAccessibilityHint(mode: DateTimeFieldProps['mode']): string {
  if (mode === 'date') return 'Formato año mes día, por ejemplo 2026-10-01';
  if (mode === 'time') return 'Formato hora y minutos, por ejemplo 08:30';
  return 'Formato ISO local de fecha y hora';
}

function webPlaceholder(mode: DateTimeFieldProps['mode']): string {
  if (mode === 'date') return 'AAAA-MM-DD';
  if (mode === 'time') return 'HH:mm';
  return 'AAAA-MM-DDTHH:mm:ss±HH:mm';
}

function webMaxLength(mode: DateTimeFieldProps['mode']): number {
  if (mode === 'date') return 10;
  if (mode === 'time') return 5;
  return 25;
}

export function DateTimeField({
  accessibilityHint,
  accessibilityLabel,
  disabled = false,
  maximumDate,
  minimumDate,
  mode,
  onChange,
  optional = false,
  value,
}: DateTimeFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStage, setPickerStage] = useState<'date' | 'time'>('date');
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  if (Platform.OS === 'web') {
    return (
      <TextInput
        accessibilityHint={accessibilityHint ?? defaultAccessibilityHint(mode)}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        editable={!disabled}
        maxLength={webMaxLength(mode)}
        onChangeText={onChange}
        placeholder={webPlaceholder(mode)}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        value={value}
      />
    );
  }

  function handleValueChange(date: Date): void {
    if (mode === 'time') {
      setShowPicker(false);
      onChange(toLocalTime(date));
      return;
    }
    if (mode === 'datetime' && Platform.OS === 'android' && pickerStage === 'date') {
      setPendingDate(date);
      setPickerStage('time');
      return;
    }
    setShowPicker(false);
    const combined = pendingDate
      ? new Date(
          pendingDate.getFullYear(),
          pendingDate.getMonth(),
          pendingDate.getDate(),
          date.getHours(),
          date.getMinutes()
        )
      : date;
    setPendingDate(null);
    setPickerStage('date');
    onChange(mode === 'date' ? toLocalDate(combined) : toLocalDateTimeIso(combined));
  }

  function handleDismiss(): void {
    setShowPicker(false);
    setPendingDate(null);
    setPickerStage('date');
  }

  const selected = parseValue(value, mode);
  return (
    <View style={styles.container}>
      <AppButton
        accessibilityHint={accessibilityHint ?? 'Abre el selector de fecha del sistema'}
        accessibilityLabel={
          value
            ? `${accessibilityLabel}: ${formatValue(value, mode)}`
            : `Elegir ${accessibilityLabel.toLowerCase()}`
        }
        disabled={disabled}
        icon={mode === 'time' ? 'clock' : 'calendar'}
        label={value ? formatValue(value, mode) : `Elegir ${accessibilityLabel.toLowerCase()}`}
        onPress={() => {
          setPickerStage('date');
          setPendingDate(null);
          setShowPicker(true);
        }}
        variant="secondary"
      />
      {optional && value ? (
        <AppButton
          accessibilityLabel={`Quitar ${accessibilityLabel.toLowerCase()}`}
          disabled={disabled}
          label={mode === 'time' ? 'Quitar hora' : 'Quitar fecha'}
          onPress={() => onChange('')}
          variant="ghost"
        />
      ) : null}
      {showPicker ? (
        <DateTimePicker
          display="default"
          {...(maximumDate ? { maximumDate } : {})}
          {...(minimumDate ? { minimumDate } : {})}
          mode={(mode === 'datetime' && Platform.OS === 'android' ? pickerStage : mode) as never}
          onDismiss={handleDismiss}
          onValueChange={(_event, date) => {
            handleValueChange(date);
          }}
          value={selected}
        />
      ) : null}
    </View>
  );
}

export function toLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(year)}-${month}-${day}`;
}

export function toLocalDateTimeIso(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
  const offsetMins = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
  return `${toLocalDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00${sign}${offsetHours}:${offsetMins}`;
}

export function toLocalTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function parseValue(value: string, mode: 'date' | 'datetime' | 'time'): Date {
  if (mode === 'time') {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (match === null) return new Date();
    const parsed = new Date();
    parsed.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return parsed;
  }
  if (!value) return new Date();
  const parsed = new Date(mode === 'date' ? `${value}T12:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatValue(value: string, mode: 'date' | 'datetime' | 'time'): string {
  if (value === '') return '';
  if (mode === 'time') return value;
  return mode === 'date' ? formatDateShort(value) : formatDateTime(value);
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: fontFamilies.body,
    fontSize: 16,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
