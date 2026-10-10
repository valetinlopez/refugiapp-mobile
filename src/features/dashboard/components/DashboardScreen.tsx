import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAnimalOptions } from '@/application/animals';
import { useHomeSummary, type HomePriority } from '@/application/home';
import { EmptyState, ErrorState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { isNetworkError } from '@/core/network';
import { useSession } from '@/features/auth/session';
import { useAuthorizedNavigation, useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, sizes, spacing } from '@/theme';

import { useDashboardOverview } from '../hooks/useDashboardOverview';
import type { DashboardAnimal } from '../types';
import { toDashboardErrorMessage } from '../utils/dashboardErrorMessages';
import { buildHomeAccessSubtitles, HOME_ACCESSES } from '../utils/homeAccess';
import { DashboardRecentAnimals } from './DashboardRecentAnimals';
import { DashboardSkeleton } from './DashboardSkeleton';
import { HomeGreeting } from './HomeGreeting';
import { HomeHero } from './HomeHero';
import { HomeQuickAccess } from './HomeQuickAccess';
import { TodayPriorities } from './TodayPriorities';
import { TodaySummaryCard } from './TodaySummaryCard';

export function DashboardScreen() {
  const capabilities = useCapabilities();
  const { user } = useSession();
  const overviewQuery = useDashboardOverview();
  const home = useHomeSummary();
  const animalOptions = useAnimalOptions();
  const accesses = useAuthorizedNavigation(HOME_ACCESSES);

  const animalsById = useMemo(
    () => new Map((animalOptions.data ?? []).map((option) => [option.id, option])),
    [animalOptions.data]
  );

  const handlePressAnimal = useCallback((animal: DashboardAnimal) => {
    router.push({ pathname: '/animals/[id]', params: { id: animal.id } });
  }, []);

  const handleOpenAgenda = useCallback(() => {
    router.push('/care-tasks');
  }, []);

  const handleOpenPriority = useCallback((priority: HomePriority) => {
    router.push({ pathname: '/care-tasks/[id]', params: { id: priority.id } });
  }, []);

  const handleRefresh = useCallback(
    () => Promise.all([overviewQuery.refetch(), home.refetch()]),
    [home, overviewQuery]
  );

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
    if (isNetworkError(overviewQuery.error)) {
      return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
          <View style={styles.state}>
            <OfflineState
              actionLabel={offlineCopy.actionLabel}
              message={offlineCopy.message}
              onAction={() => void overviewQuery.refetch()}
              testID={OFFLINE_STATE_TEST_ID}
              title={offlineCopy.title}
            />
          </View>
        </SafeAreaView>
      );
    }
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

  const accessSubtitles = buildHomeAccessSubtitles({
    animalCount: overview.totals.animals,
    expenseCount: home.expenseCount,
    pendingCareTaskCount: home.pendingCareTaskCount,
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        testID="dashboard-screen"
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={handleRefresh}
            refreshing={overviewQuery.isRefetching}
            tintColor={colors.positive}
          />
        }
      >
        <HomeGreeting firstName={user?.firstName} />
        <HomeHero />
        <View style={styles.body}>
          <TodaySummaryCard
            animalCount={overview.totals.animals}
            pendingCareTaskCount={home.pendingCareTaskCount}
            underTreatmentCount={overview.totals.byStatus.under_treatment}
          />
          <HomeQuickAccess accesses={accesses} subtitles={accessSubtitles} />
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
            <>
              <TodayPriorities
                animalsById={animalsById}
                isError={home.prioritiesIsError}
                isPending={home.prioritiesIsPending}
                onOpenAgenda={handleOpenAgenda}
                onOpenPriority={handleOpenPriority}
                onRetry={() => void home.refetch()}
                priorities={home.priorities}
              />
              <DashboardRecentAnimals
                animals={overview.recentAnimals}
                onPress={handlePressAnimal}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  content: {
    alignSelf: 'center',
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    paddingBottom: sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + spacing.lg,
    width: '100%',
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
