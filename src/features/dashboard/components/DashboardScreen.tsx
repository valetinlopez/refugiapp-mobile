import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { AccountMenuButton } from '@/features/auth/components/AccountMenuButton';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

import { useDashboardOverview } from '../hooks/useDashboardOverview';
import type { DashboardAnimal } from '../types';
import { capabilitiesForRoles } from '../utils/capabilities';
import { toDashboardErrorMessage } from '../utils/dashboardErrorMessages';
import { filterQuickActions, QUICK_ACTIONS } from '../utils/quickActions';
import { DashboardQuickActions } from './DashboardQuickActions';
import { DashboardRecentAnimals } from './DashboardRecentAnimals';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardTotalsCard } from './DashboardTotalsCard';

export function DashboardScreen() {
  const { user } = useSession();
  const capabilities = useMemo(() => capabilitiesForRoles(user?.roles ?? []), [user?.roles]);
  const overviewQuery = useDashboardOverview();
  const quickActions = useMemo(
    () => filterQuickActions(QUICK_ACTIONS, capabilities),
    [capabilities]
  );

  const handlePressAnimal = useCallback((animal: DashboardAnimal) => {
    router.push({ pathname: '/animals/[id]', params: { id: animal.id } });
  }, []);

  if (overviewQuery.isPending) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.state}>
          <DashboardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (overviewQuery.isError) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.state}>
          <ErrorState
            actionLabel="Reintentar"
            message={toDashboardErrorMessage(overviewQuery.error)}
            onAction={() => void overviewQuery.refetch()}
            title="No se pudo cargar el panel"
          />
        </View>
      </SafeAreaView>
    );
  }

  const overview = overviewQuery.data;
  const isEmpty = overview.totals.animals === 0 && overview.recentAnimals.length === 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={() => void overviewQuery.refetch()}
            refreshing={overviewQuery.isRefetching}
            tintColor={colors.positive}
          />
        }
      >
        <View style={styles.headingRow}>
          <View style={styles.heading}>
            <AppText variant="heading1">Inicio</AppText>
            <AppText color="textSecondary">Resumen del refugio</AppText>
          </View>
          <AccountMenuButton />
        </View>

        {isEmpty ? (
          <EmptyState
            message={
              capabilities.canEditAnimal
                ? 'Todavía no hay animales activos. Podés dar de alta el primero.'
                : 'Todavía no hay animales activos en el refugio.'
            }
            title="Sin datos"
          />
        ) : (
          <View style={styles.body}>
            <DashboardTotalsCard totals={overview.totals} />
            <DashboardQuickActions actions={quickActions} />
            <DashboardRecentAnimals animals={overview.recentAnimals} onPress={handlePressAnimal} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  heading: {
    flex: 1,
    gap: spacing.xxs,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  state: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
