import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { sizes, spacing } from '@/theme';

import { useMedicalRecordsByAnimal } from '../hooks/useMedicalRecordsByAnimal';
import { formatRecordDate, getRecordTypeLabel } from '../utils/medicalRecordPresentation';

export interface ClinicalHistoryProps {
  animalId: string;
  onEditRecord?(recordId: string): void;
}

export function ClinicalHistory({ animalId, onEditRecord }: ClinicalHistoryProps) {
  const recordsQuery = useMedicalRecordsByAnimal(animalId);

  if (recordsQuery.isPending) {
    return <LoadingState label="Cargando evolución clínica" />;
  }

  if (recordsQuery.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar la evolución clínica del animal."
        onAction={() => void recordsQuery.refetch()}
        title="No se pudo cargar la evolución clínica"
      />
    );
  }

  if (recordsQuery.data === undefined || recordsQuery.data.items.length === 0) {
    return (
      <EmptyState
        message="Todavía no hay registros clínicos para este animal."
        title="Sin evolución clínica"
      />
    );
  }

  return (
    <View accessibilityLabel="Evolución clínica" style={styles.list}>
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
