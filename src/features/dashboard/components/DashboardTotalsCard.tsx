import { StyleSheet, View } from 'react-native';

import { AppBadge, AppCard, AppDivider, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { DASHBOARD_STATUS_ORDER, type DashboardTotals } from '../types';
import { getStatusPresentation } from '../utils/presentation';

export function DashboardTotalsCard({ totals }: { totals: DashboardTotals }) {
  return (
    <AppCard variant="organic">
      <AppText color="textSecondary" variant="label">
        Animales activos
      </AppText>
      <AppText variant="heading2">{totals.animals}</AppText>
      <AppDivider />
      <View style={styles.badges}>
        {DASHBOARD_STATUS_ORDER.map((status) => {
          const presentation = getStatusPresentation(status);
          return (
            <AppBadge
              icon={presentation.icon}
              key={status}
              label={`${presentation.label}: ${totals.byStatus[status]}`}
              tone={presentation.tone}
            />
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
