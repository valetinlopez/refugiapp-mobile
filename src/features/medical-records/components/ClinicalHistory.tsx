import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { FilterChip } from '@/components/patterns';
import { sizes, spacing } from '@/theme';

import { useMedicalRecordsByAnimal } from '../hooks/useMedicalRecordsByAnimal';
import { formatRecordDate, getRecordTypeLabel } from '../utils/medicalRecordPresentation';
import type { MedicalRecordType } from '../types';

export interface ClinicalHistoryProps {
  animalId: string;
  onEditRecord?(recordId: string): void;
}

export function ClinicalHistory({ animalId, onEditRecord }: ClinicalHistoryProps) {
  const [recordType, setRecordType] = useState<MedicalRecordType | undefined>();
  const [rangeDays, setRangeDays] = useState<number | undefined>();
  const filters = useMemo(() => {
    const typeFilter = recordType === undefined ? {} : { recordType };
    if (rangeDays === undefined) return typeFilter;
    const from = new Date();
    from.setDate(from.getDate() - rangeDays);
    return { ...typeFilter, from: from.toISOString(), to: new Date().toISOString() };
  }, [rangeDays, recordType]);
  const recordsQuery = useMedicalRecordsByAnimal(animalId, filters);

  const filtersView = (
    <View style={styles.filters}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <FilterChip
            label="Todos los tipos"
            onPress={() => setRecordType(undefined)}
            selected={recordType === undefined}
          />
          {(['consultation', 'vaccination', 'treatment', 'other'] as MedicalRecordType[]).map(
            (type) => (
              <FilterChip
                key={type}
                label={getRecordTypeLabel(type)}
                onPress={() => setRecordType(type)}
                selected={recordType === type}
              />
            )
          )}
        </View>
      </ScrollView>
      <View style={styles.filterRow}>
        <FilterChip
          label="Todo el período"
          onPress={() => setRangeDays(undefined)}
          selected={rangeDays === undefined}
        />
        <FilterChip
          label="Últimos 30 días"
          onPress={() => setRangeDays(30)}
          selected={rangeDays === 30}
        />
        <FilterChip
          label="Últimos 90 días"
          onPress={() => setRangeDays(90)}
          selected={rangeDays === 90}
        />
      </View>
    </View>
  );

  if (recordsQuery.isPending) {
    return (
      <>
        {filtersView}
        <LoadingState label="Cargando evolución clínica" />
      </>
    );
  }

  if (recordsQuery.isError) {
    return (
      <>
        {filtersView}
        <ErrorState
          actionLabel="Reintentar"
          message="No pudimos cargar la evolución clínica del animal."
          onAction={() => void recordsQuery.refetch()}
          title="No se pudo cargar la evolución clínica"
        />
      </>
    );
  }

  if (recordsQuery.data === undefined || recordsQuery.data.items.length === 0) {
    return (
      <>
        {filtersView}
        <EmptyState
          message="Todavía no hay registros clínicos para este animal."
          title="Sin evolución clínica"
        />
      </>
    );
  }

  return (
    <View accessibilityLabel="Evolución clínica" style={styles.list}>
      {filtersView}
      {recordsQuery.data.items.map((record) => (
        <AppCard
          accessibilityLabel={`${getRecordTypeLabel(record.recordType)}, ${record.title}`}
          key={record.id}
        >
          <View style={styles.row}>
            <AppText color="textSecondary" style={styles.rowLabel} variant="label">
              {getRecordTypeLabel(record.recordType)}
            </AppText>
            <View style={styles.cardActions}>
              <AppText color="textSecondary" style={styles.rowMeta} variant="caption">
                {formatRecordDate(record.occurredAt)}
              </AppText>
              {onEditRecord ? (
                <Pressable
                  accessibilityLabel={`Editar ${record.title}`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => onEditRecord(record.id)}
                  style={styles.edit}
                >
                  <AppIcon color="textSecondary" name="refresh" size={sizes.iconSm} />
                </Pressable>
              ) : null}
            </View>
          </View>
          <AppText variant="bodyStrong">{record.title}</AppText>
          {record.diagnosis !== null ? (
            <TextSection label="Diagnóstico" value={record.diagnosis} />
          ) : null}
          {record.treatment !== null ? (
            <TextSection label="Tratamiento" value={record.treatment} />
          ) : null}
          {record.notes !== null ? <TextSection label="Notas" value={record.notes} /> : null}
        </AppCard>
      ))}
    </View>
  );
}

function TextSection({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.section}>
      <AppText color="textSecondary" variant="label">
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filters: { gap: spacing.xs },
  cardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: spacing.xs,
    justifyContent: 'flex-end',
  },
  edit: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
  },
  list: { gap: spacing.sm },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  rowLabel: {
    flexShrink: 0,
  },
  rowMeta: {
    flexShrink: 1,
    textAlign: 'right',
  },
  section: { gap: spacing.xxs, marginTop: spacing.sm },
});
