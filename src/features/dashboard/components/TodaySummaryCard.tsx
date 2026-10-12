import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText, type AppIconName } from '@/components/primitives';
import { colors, radii, sizes, spacing, type ColorToken } from '@/theme';

export interface TodaySummaryCardProps {
  animalCount: number;
  pendingCareTaskCount: number | undefined;
  underTreatmentCount: number;
}

interface SummaryMetric {
  icon: AppIconName;
  id: string;
  label: string;
  tone: ColorToken;
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
      <View style={[styles.metricIcon, { backgroundColor: colors[metric.tone] }]}>
        <AppIcon color="textInverse" name={metric.icon} size={sizes.iconMd} />
      </View>
      <AppText numberOfLines={1} variant="heading2">
        {hasValue ? metric.value : '—'}
      </AppText>
      <AppText color="textSecondary" numberOfLines={2} style={styles.metricLabel} variant="caption">
        {metric.label}
      </AppText>
    </View>
  );
}

/**
 * "Resumen de hoy" for Inicio (D36 / RFG-169, D38.1 / RFG-172).
 *
 * Three symmetric, equal-weight indicators backed by real contracts: total
 * animals and animals under treatment from `GET /dashboard/overview`, plus the
 * exact pending-care-task count. A failed count degrades to an em dash instead
 * of breaking the card.
 *
 * The layout is a stretched 3-up row with vertical dividers. The circular icon
 * keeps a semantic accent (animals `positive`, treatment `info`, pending
 * `warning`) but the metric still reads from icon + number + label, so color is
 * never the only signal. `heading2` (28 pt Newsreader) keeps the metric inside
 * the column with the amplified font, where `display` (42 pt) would overflow.
 */
export function TodaySummaryCard({
  animalCount,
  pendingCareTaskCount,
  underTreatmentCount,
}: TodaySummaryCardProps) {
  const metrics: readonly SummaryMetric[] = [
    { icon: 'paw', id: 'animals', label: 'Animales', tone: 'positive', value: animalCount },
    {
      icon: 'medical',
      id: 'under-treatment',
      label: 'En tratamiento',
      tone: 'info',
      value: underTreatmentCount,
    },
    {
      icon: 'calendar',
      id: 'pending-care-tasks',
      label: 'Cuidados pendientes',
      tone: 'warning',
      value: pendingCareTaskCount,
    },
  ];

  return (
    <AppCard testID="home-summary" variant="organic">
      <View style={styles.metrics}>
        {metrics.map((metric, index) => (
          <Fragment key={metric.id}>
            {index > 0 ? (
              <View accessibilityRole="none" style={styles.divider} testID="home-summary-divider" />
            ) : null}
            <SummaryMetricItem metric={metric} />
          </Fragment>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  divider: {
    alignSelf: 'stretch',
    backgroundColor: colors.divider,
    marginHorizontal: spacing.xs,
    width: sizes.divider,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xxs,
    justifyContent: 'center',
    minWidth: 0,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: sizes.avatarSm,
    justifyContent: 'center',
    width: sizes.avatarSm,
  },
  metricLabel: {
    textAlign: 'center',
  },
  metrics: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
});
