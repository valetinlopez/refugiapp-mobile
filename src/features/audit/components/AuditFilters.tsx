import { ScrollView, StyleSheet, View } from 'react-native';

import { DateTimeField, FilterChip } from '@/components/patterns';
import { AppButton, AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

import type { AuditAction } from '../types';
import { AUDIT_ACTIONS, auditActionLabel } from '../utils/auditPresentation';

interface Props {
  action: AuditAction | undefined;
  error: string | null;
  from: string;
  onAction(value?: AuditAction): void;
  onApply(): void;
  onClear(): void;
  onFrom(value: string): void;
  onTo(value: string): void;
  to: string;
}

export function AuditFilters({
  action,
  error,
  from,
  onAction,
  onApply,
  onClear,
  onFrom,
  onTo,
  to,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText variant="heading3">Filtros</AppText>
      <ScrollView
        contentContainerStyle={styles.chips}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <FilterChip label="Todas" onPress={() => onAction(undefined)} selected={!action} />
        {AUDIT_ACTIONS.map((value) => (
          <FilterChip
            key={value}
            label={auditActionLabel(value)}
            onPress={() => onAction(value)}
            selected={action === value}
          />
        ))}
      </ScrollView>
      <View style={styles.dates}>
        <View style={styles.field}>
          <AppText variant="label">Desde</AppText>
          <DateTimeField
            accessibilityLabel="Fecha desde"
            mode="date"
            onChange={onFrom}
            optional
            value={from}
          />
        </View>
        <View style={styles.field}>
          <AppText variant="label">Hasta</AppText>
          <DateTimeField
            accessibilityLabel="Fecha hasta"
            mode="date"
            onChange={onTo}
            optional
            value={to}
          />
        </View>
      </View>
      {error ? (
        <AppText accessibilityRole="alert" color="danger">
          {error}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <AppButton label="Limpiar" onPress={onClear} variant="ghost" />
        <AppButton icon="refresh" label="Aplicar filtros" onPress={onApply} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chips: { gap: spacing.xs },
  container: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  dates: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  field: { flex: 1, gap: spacing.xs, minWidth: 220 },
});
