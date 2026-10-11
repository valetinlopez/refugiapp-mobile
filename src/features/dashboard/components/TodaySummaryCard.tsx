import { StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText, type AppIconName } from '@/components/primitives';
import { spacing } from '@/theme';

export interface TodaySummaryCardProps {
  animalCount: number;
  pendingCareTaskCount: number | undefined;
  underTreatmentCount: number;
}

interface SummaryMetric {
  icon: AppIconName;
  id: string;
  label: string;
  value: number | undefined;
}

function SummaryMetricItem({ metric }: { metric: SummaryMetric }) {
  const hasValue = metric.value !== undefined;
  return (
    <View
      accessibilityLabel={`${metric.label}: ${hasValue ? metric.value : 'sin datos'}`}
      accessibilityRole="summary"
      style={styles.metric}
    >
      <AppIcon color="positive" name={metric.icon} size={22} />
      <AppText variant="heading2">{hasValue ? metric.value : '—'}</AppText>
      <AppText color="textSecondary" style={styles.metricLabel} variant="label">
        {metric.label}
      </AppText>
    </View>
  );
}

/**
 * "Resumen de hoy" for Inicio (D36 / RFG-169).
 *
 * Three indicators backed by real contracts: total animals and animals under
 * treatment from `GET /dashboard/overview`, plus the exact pending-care-task
 * count. A failed count degrades to an em dash instead of breaking the card.
 */
export function TodaySummaryCard({
  animalCount,
  pendingCareTaskCount,
  underTreatmentCount,
}: TodaySummaryCardProps) {
  const metrics: readonly SummaryMetric[] = [
    { icon: 'paw', id: 'animals', label: 'Animales', value: animalCount },
    {
      icon: 'medical',
      id: 'under-treatment',
      label: 'En tratamiento',
      value: underTreatmentCount,
    },
    {
      icon: 'calendar',
      id: 'pending-care-tasks',
      label: 'Cuidados pendientes',
      value: pendingCareTaskCount,
    },
  ];

  return (
    <AppCard style={styles.card} testID="home-summary" variant="organic">
      <View style={styles.metrics}>
        {metrics.map((metric) => (
          <SummaryMetricItem key={metric.id} metric={metric} />
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  metric: {
    flexBasis: '28%',
    flexGrow: 1,
    gap: spacing.xxs,
    minWidth: 96,
  },
  metricLabel: {
    flexShrink: 1,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
