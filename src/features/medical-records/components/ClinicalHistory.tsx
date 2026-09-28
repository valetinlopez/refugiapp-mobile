import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { DateTimeField, FilterChip } from '@/components/patterns';
import { sizes, spacing } from '@/theme';

import { useMedicalRecordsByAnimal } from '../hooks/useMedicalRecordsByAnimal';
import type { MedicalRecordType } from '../types';
import {
  buildClinicalHistoryFilters,
  getCustomRangeError,
  type ClinicalRangeMode,
} from '../utils/clinicalHistoryFilters';
import { formatRecordDate, getRecordTypeLabel } from '../utils/medicalRecordPresentation';
import { MEDICAL_RECORD_TYPE_VALUES } from '../utils/medicalRecordSchema';

export interface ClinicalHistoryProps {
  animalId: string;
  onEditRecord?(recordId: string): void;
}

export function ClinicalHistory({ animalId, onEditRecord }: ClinicalHistoryProps) {
  const [recordType, setRecordType] = useState<MedicalRecordType | undefined>();
  const [range, setRange] = useState<ClinicalRangeMode>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const customRangeError = range === 'custom' ? getCustomRangeError(from, to) : null;

  const filters = useMemo(
    () =>
      buildClinicalHistoryFilters({
        from,
        range,
        to,
        ...(recordType === undefined ? {} : { recordType }),
      }),
    [from, range, recordType, to]
  );
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
          {MEDICAL_RECORD_TYPE_VALUES.map((type) => (
            <FilterChip
              key={type}
              label={getRecordTypeLabel(type)}
              onPress={() => setRecordType(type)}
              selected={recordType === type}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.filterRow}>
        <FilterChip
          label="Todo el período"
          onPress={() => setRange('all')}
          selected={range === 'all'}
        />
        <FilterChip label="Últimos 30 días" onPress={() => setRange(30)} selected={range === 30} />
        <FilterChip label="Últimos 90 días" onPress={() => setRange(90)} selected={range === 90} />
        <FilterChip
          label="Personalizado"
          onPress={() => setRange('custom')}
          selected={range === 'custom'}
        />
      </View>
      {range === 'custom' ? (
        <View style={styles.rangeFields}>
          <View style={styles.rangeField}>
            <AppText variant="label">Desde</AppText>
            <DateTimeField
              accessibilityLabel="Desde"
              mode="date"
              onChange={setFrom}
              optional
              value={from}
            />
          </View>
          <View style={styles.rangeField}>
            <AppText variant="label">Hasta</AppText>
            <DateTimeField
              accessibilityLabel="Hasta"
              mode="date"
              onChange={setTo}
              optional
              value={to}
            />
          </View>
          {customRangeError ? (
            <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
              {customRangeError}
            </AppText>
          ) : null}
        </View>
      ) : null}
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filters: { gap: spacing.xs },
  list: { gap: spacing.sm },
  rangeField: { gap: spacing.xs },
  rangeFields: { gap: spacing.xs, marginTop: spacing.xs },
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
