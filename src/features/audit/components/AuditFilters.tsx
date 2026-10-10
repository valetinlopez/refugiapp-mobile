import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { DateTimeField, FilterChip } from '@/components/patterns';
import { AppButton, AppCard, AppText } from '@/components/primitives';
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
  onResourceId(value: string): void;
  onResourceType(value?: AuditResourceType): void;
  onTo(value: string): void;
  resourceId: string;
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
  onResourceId,
  onResourceType,
  onTo,
  resourceId,
  resourceType,
  to,
}: Props) {
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [resourceSheetVisible, setResourceSheetVisible] = useState(false);
  const hasDraftFilters = Boolean(action || resourceType || actor || resourceId || from || to);

  function selectAction(value?: AuditAction): void {
    onAction(value);
    setActionSheetVisible(false);
  }

  function selectResourceType(value?: AuditResourceType): void {
    onResourceType(value);
    setResourceSheetVisible(false);
  }

  return (
    <>
      <AppCard style={styles.container} variant="organic">
        <View style={styles.heading}>
          <AppText accessibilityRole="header" variant="heading2">
            Filtros
          </AppText>
          <AppButton
            disabled={!hasDraftFilters}
            label="Limpiar"
            onPress={onClear}
            testID="audit-filter-clear"
            variant="ghost"
          />
        </View>

        <View style={styles.selectorRow}>
          <AppButton
            icon="filter"
            label={action ? auditActionLabel(action) : 'Todas las acciones'}
            onPress={() => setActionSheetVisible(true)}
            style={styles.selector}
            testID="audit-filter-action-open"
            variant="secondary"
          />
          <AppButton
            icon="document"
            label={resourceType ? auditResourceTypeLabel(resourceType) : 'Todos los recursos'}
            onPress={() => setResourceSheetVisible(true)}
            style={styles.selector}
            testID="audit-filter-resource-open"
            variant="secondary"
          />
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.field}>
            <AppText variant="label">Actor</AppText>
            <AuditInput
              accessibilityLabel="Actor (UUID)"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onActor}
              placeholder="UUID del actor"
              testID="audit-filter-actor"
              value={actor}
            />
          </View>
          <View style={styles.field}>
            <AppText variant="label">Identificador</AppText>
            <AuditInput
              accessibilityLabel="Identificador del recurso (UUID)"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onResourceId}
              placeholder="UUID del recurso"
              testID="audit-filter-resource-id"
              value={resourceId}
            />
          </View>
        </View>

        <View style={styles.fieldRow}>
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
        <AppButton
          icon="refresh"
          label="Aplicar filtros"
          onPress={onApply}
          testID="audit-filter-apply"
        />
      </AppCard>

      <BottomSheet
        closeAccessibilityLabel="Cerrar selección de acción"
        onClose={() => setActionSheetVisible(false)}
        testID="audit-action-sheet"
        title="Filtrar por acción"
        visible={actionSheetVisible}
      >
        <View style={styles.options}>
          <FilterChip
            label="Todas las acciones"
            onPress={() => selectAction(undefined)}
            selected={!action}
            testID="audit-filter-action-all"
          />
          {AUDIT_ACTIONS.map((value) => (
            <FilterChip
              key={value}
              label={auditActionLabel(value)}
              onPress={() => selectAction(value)}
              selected={action === value}
              testID={`audit-filter-action-${value}`}
            />
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        closeAccessibilityLabel="Cerrar selección de recurso"
        onClose={() => setResourceSheetVisible(false)}
        testID="audit-resource-sheet"
        title="Filtrar por recurso"
        visible={resourceSheetVisible}
      >
        <View style={styles.options}>
          <FilterChip
            label="Todos los recursos"
            onPress={() => selectResourceType(undefined)}
            selected={!resourceType}
            testID="audit-filter-resource-all"
          />
          {AUDIT_RESOURCE_TYPES.map((value) => (
            <FilterChip
              key={value}
              label={auditResourceTypeLabel(value)}
              onPress={() => selectResourceType(value)}
              selected={resourceType === value}
              testID={`audit-filter-resource-${value}`}
            />
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

function AuditInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  field: { flex: 1, gap: spacing.xs, minWidth: 220 },
  fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
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
  options: { alignItems: 'flex-start', gap: spacing.xs },
  selector: { flex: 1, minWidth: 220 },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
