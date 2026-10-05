import { ScrollView, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { DateTimeField, FilterChip } from '@/components/patterns';
import { AppButton, AppText } from '@/components/primitives';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import type { AuditAction, AuditResourceType } from '../types';
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  auditActionLabel,
  auditResourceTypeLabel,
} from '../utils/auditPresentation';

interface Props {
  action: AuditAction | undefined;
  actor: string;
  error: string | null;
  from: string;
  onAction(value?: AuditAction): void;
  onActor(value: string): void;
  onApply(): void;
  onClear(): void;
  onFrom(value: string): void;
  onResourceType(value?: AuditResourceType): void;
  onTo(value: string): void;
  resourceType: AuditResourceType | undefined;
  to: string;
}

export function AuditFilters({
  action,
  actor,
  error,
  from,
  onAction,
  onActor,
  onApply,
  onClear,
  onFrom,
  onResourceType,
  onTo,
  resourceType,
  to,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText variant="heading3">Filtros</AppText>
      <View style={styles.chipSection}>
        <AppText variant="label">Acción</AppText>
        <ScrollView
          contentContainerStyle={styles.chips}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <FilterChip
            label="Todas"
            onPress={() => onAction(undefined)}
            selected={!action}
            testID="audit-filter-action-all"
          />
          {AUDIT_ACTIONS.map((value) => (
            <FilterChip
              key={value}
              label={auditActionLabel(value)}
              onPress={() => onAction(value)}
              selected={action === value}
              testID={`audit-filter-action-${value}`}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.chipSection}>
        <AppText variant="label">Recurso</AppText>
        <ScrollView
          contentContainerStyle={styles.chips}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <FilterChip
            label="Todos"
            onPress={() => onResourceType(undefined)}
            selected={!resourceType}
            testID="audit-filter-resource-all"
          />
          {AUDIT_RESOURCE_TYPES.map((value) => (
            <FilterChip
              key={value}
              label={auditResourceTypeLabel(value)}
              onPress={() => onResourceType(value)}
              selected={resourceType === value}
              testID={`audit-filter-resource-${value}`}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.field}>
        <AppText variant="label">Actor (UUID)</AppText>
        <ActorInput
          accessibilityLabel="Actor (UUID)"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onActor}
          placeholder="Ej.: 123e4567-…"
          testID="audit-filter-actor"
          value={actor}
        />
      </View>
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
        <AppButton label="Limpiar" onPress={onClear} testID="audit-filter-clear" variant="ghost" />
        <AppButton
          icon="refresh"
          label="Aplicar filtros"
          onPress={onApply}
          testID="audit-filter-apply"
        />
      </View>
    </View>
  );
}

function ActorInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipSection: { gap: spacing.xs },
  chips: { gap: spacing.xs },
  container: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  dates: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  field: { flex: 1, gap: spacing.xs, minWidth: 220 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: fontFamilies.body,
    fontSize: 16,
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
