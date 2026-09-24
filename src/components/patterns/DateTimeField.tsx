import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

export interface DateTimeFieldProps {
  accessibilityLabel: string;
  disabled?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
  mode: 'date' | 'datetime';
  onChange(value: string): void;
  optional?: boolean;
  value: string;
}

export function DateTimeField({
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
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        editable={!disabled}
        maxLength={mode === 'date' ? 10 : 25}
        onChangeText={onChange}
        placeholder={mode === 'date' ? 'AAAA-MM-DD' : 'AAAA-MM-DDTHH:mm:ss±HH:mm'}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        value={value}
      />
    );
  }

  function handleChange(event: DateTimePickerEvent, date?: Date): void {
    if (event.type !== 'set' || !date) {
      setShowPicker(false);
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

  const selected = parseValue(value, mode);
  return (
    <View style={styles.container}>
      <AppButton
        accessibilityLabel={
          value
            ? `${accessibilityLabel}: ${formatValue(value, mode)}`
            : `Elegir ${accessibilityLabel.toLowerCase()}`
        }
        disabled={disabled}
        icon="calendar"
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
          label="Quitar fecha"
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
          onChange={handleChange}
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

function parseValue(value: string, mode: 'date' | 'datetime'): Date {
  if (!value) return new Date();
  const parsed = new Date(mode === 'date' ? `${value}T12:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatValue(value: string, mode: 'date' | 'datetime'): string {
  const parsed = parseValue(value, mode);
  return new Intl.DateTimeFormat(
    'es-AR',
    mode === 'date' ? { dateStyle: 'short' } : { dateStyle: 'short', timeStyle: 'short' }
  ).format(parsed);
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
