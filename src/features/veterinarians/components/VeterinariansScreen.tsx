import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View, type ListRenderItem } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { FilterChip } from '@/components/patterns';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { AppButton, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, radii, sizes, spacing } from '@/theme';

import { useVeterinarians } from '../hooks/useVeterinarians';
import type { VeterinarianResponse } from '../types';
import { toVeterinarianErrorMessage } from '../utils/veterinarianPresentation';
import { VeterinarianCard } from './VeterinarianCard';

const SEARCH_DEBOUNCE_MS = 400;
type StatusFilterValue = 'active' | 'inactive';

export function VeterinariansScreen({ canWrite }: { canWrite: boolean }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const filters = useMemo(
    () => ({
      ...(search.trim() !== '' ? { name: search.trim() } : {}),
      isActive: statusFilter === 'active',
    }),
    [search, statusFilter]
  );
  const veterinariansQuery = useVeterinarians(filters);

  const veterinarians = useMemo(
    () => veterinariansQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [veterinariansQuery.data]
  );

  const handlePress = useCallback((veterinarian: VeterinarianResponse) => {
    router.push({ pathname: '/veterinarians/[id]', params: { id: veterinarian.id } });
  }, []);

  const renderItem = useCallback<ListRenderItem<VeterinarianResponse>>(
    ({ item }) => <VeterinarianCard onPress={handlePress} veterinarian={item} />,
    [handlePress]
  );

  const handleEndReached = useCallback(() => {
    if (veterinariansQuery.hasNextPage && !veterinariansQuery.isFetchingNextPage) {
      void veterinariansQuery.fetchNextPage();
    }
  }, [veterinariansQuery]);

  if (veterinariansQuery.isPending) {
    return <LoadingState label="Cargando veterinarios" />;
  }

  if (veterinariansQuery.isError && veterinariansQuery.data === undefined) {
    if (isNetworkError(veterinariansQuery.error)) {
      return (
        <OfflineState
          actionLabel={offlineCopy.actionLabel}
          message={offlineCopy.message}
          onAction={() => void veterinariansQuery.refetch()}
          testID={OFFLINE_STATE_TEST_ID}
          title={offlineCopy.title}
        />
      );
    }
    return (
      <ErrorState
        actionLabel="Reintentar"
        message={toVeterinarianErrorMessage(veterinariansQuery.error)}
        onAction={() => void veterinariansQuery.refetch()}
        title="No se pudieron cargar los veterinarios"
      />
    );
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <AppText variant="heading1">Veterinarios</AppText>
          <AppText color="textSecondary">
            {veterinariansQuery.data?.pages[0]?.total ?? 0} profesionales
          </AppText>
        </View>
        {canWrite ? (
          <AppButton
            icon="medical"
            label="Nuevo"
            onPress={() => router.push('/veterinarians/new' as Href)}
            variant="secondary"
          />
        ) : null}
      </View>
      <TextInput
        accessibilityLabel="Buscar veterinario"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setSearchInput}
        placeholder="Buscar por nombre"
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
        value={searchInput}
      />
      <StatusFilter selected={statusFilter} onSelect={setStatusFilter} />
    </View>
  );

  return (
    <FlatList
      {...virtualizedListPerformanceProps}
      contentContainerStyle={styles.list}
      data={veterinarians}
      keyExtractor={(veterinarian) => veterinarian.id}
      ListEmptyComponent={
        <EmptyState
          message={
            canWrite
              ? 'Todavía no hay veterinarios con ese estado. Podés dar de alta uno nuevo.'
              : 'Todavía no hay veterinarios con ese estado.'
          }
          title="Sin veterinarios"
        />
      }
      ListFooterComponent={
        veterinariansQuery.isFetchingNextPage ? (
          <LoadingState label="Cargando más veterinarios" />
        ) : veterinariansQuery.isFetchNextPageError ? (
          <View style={styles.paginationError}>
            <AppText color="danger">No pudimos cargar más veterinarios.</AppText>
            <AppButton
              label="Reintentar carga"
              onPress={() => void veterinariansQuery.fetchNextPage()}
              variant="secondary"
            />
          </View>
        ) : null
      }
      ListHeaderComponent={header}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      onRefresh={() => void veterinariansQuery.refetch()}
      refreshing={veterinariansQuery.isRefetching}
      renderItem={renderItem}
      testID="veterinarians-list"
    />
  );
}

function StatusFilter({
  onSelect,
  selected,
}: {
  onSelect(status: StatusFilterValue): void;
  selected: StatusFilterValue;
}) {
  return (
    <View style={styles.filterGroup}>
      <AppText variant="label">Estado</AppText>
      <View style={styles.filters}>
        <FilterChip
          label="Activos"
          onPress={() => onSelect('active')}
          selected={selected === 'active'}
        />
        <FilterChip
          label="Inactivos"
          onPress={() => onSelect('inactive')}
          selected={selected === 'inactive'}
        />
      </View>
    </View>
  );
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

const styles = StyleSheet.create({
  filterGroup: { gap: spacing.xxs },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  heading: { flex: 1, gap: spacing.xxs },
  headingRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  list: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  paginationError: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.md,
  },
});
