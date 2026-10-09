import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import {
  DecorativeBackground,
  ScreenHeader,
  SectionHeader,
  SegmentedControl,
  type SegmentedControlOption,
} from '@/components/patterns';
import { AppButton, AppText, FAB } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, radii, sizes, spacing } from '@/theme';

import {
  flattenVeterinarianPages,
  useVeterinarians,
  type VeterinarianListFilters,
} from '../hooks/useVeterinarians';
import type { VeterinarianResponse, VeterinarianStatusFilter } from '../types';
import {
  hasActiveVeterinarianFilters,
  toVeterinarianAdvancedFilters,
  toVeterinarianErrorMessage,
  toVeterinarianSearchFilter,
} from '../utils/veterinarianPresentation';
import { VeterinarianCard } from './VeterinarianCard';
import { VeterinarianFilterSheet } from './VeterinarianFilterSheet';

const SEARCH_DEBOUNCE_MS = 400;

const STATUS_OPTIONS: readonly SegmentedControlOption<VeterinarianStatusFilter>[] = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
];

export function VeterinariansScreen({ canWrite }: { canWrite: boolean }) {
  const [status, setStatus] = useState<VeterinarianStatusFilter>('all');
  const [quickSearch, setQuickSearch] = useState('');
  const debouncedQuickSearch = useDebouncedValue(quickSearch, SEARCH_DEBOUNCE_MS);
  const [advancedFilters, setAdvancedFilters] = useState<VeterinarianListFilters>({});
  const [filterDraft, setFilterDraft] = useState({ name: '', licenseNumber: '' });
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const searchFilters = useMemo<VeterinarianListFilters>(() => {
    if (advancedFilters.name !== undefined || advancedFilters.licenseNumber !== undefined) {
      return advancedFilters;
    }
    return toVeterinarianSearchFilter(debouncedQuickSearch);
  }, [advancedFilters, debouncedQuickSearch]);

  const filters = useMemo<VeterinarianListFilters>(
    () => ({
      ...searchFilters,
      ...(status === 'all' ? {} : { isActive: status === 'active' }),
    }),
    [searchFilters, status]
  );

  const veterinariansQuery = useVeterinarians(filters);
  const veterinarians = useMemo(
    () => flattenVeterinarianPages(veterinariansQuery.data?.pages),
    [veterinariansQuery.data?.pages]
  );
  const total = veterinariansQuery.data?.pages[0]?.total ?? 0;
  const hasFilters = hasActiveVeterinarianFilters(filters, status);

  const handlePress = useCallback((veterinarian: VeterinarianResponse) => {
    router.push({ pathname: '/veterinarians/[id]', params: { id: veterinarian.id } });
  }, []);
  const renderItem = useCallback<ListRenderItem<VeterinarianResponse>>(
    ({ item }) => <VeterinarianCard onPress={handlePress} veterinarian={item} />,
    [handlePress]
  );
  const loadMore = useCallback(() => {
    if (veterinariansQuery.hasNextPage && !veterinariansQuery.isFetchingNextPage) {
      void veterinariansQuery.fetchNextPage();
    }
  }, [veterinariansQuery]);
  const refresh = useCallback(() => {
    void veterinariansQuery.refetch();
  }, [veterinariansQuery]);
  const handleQuickSearchChange = useCallback((value: string) => {
    setQuickSearch(value);
    if (value.trim() !== '') setAdvancedFilters({});
  }, []);
  const openFilterSheet = useCallback(() => {
    setFilterDraft({
      name: advancedFilters.name ?? '',
      licenseNumber: advancedFilters.licenseNumber ?? '',
    });
    setFilterSheetVisible(true);
  }, [advancedFilters]);
  const applyAdvancedFilters = useCallback(() => {
    setAdvancedFilters(toVeterinarianAdvancedFilters(filterDraft.name, filterDraft.licenseNumber));
    setQuickSearch('');
    setFilterSheetVisible(false);
  }, [filterDraft]);
  const clearFilters = useCallback(() => {
    setStatus('all');
    setQuickSearch('');
    setAdvancedFilters({});
    setFilterDraft({ name: '', licenseNumber: '' });
  }, []);

  const listState = veterinariansQuery.isPending ? (
    <LoadingState label="Cargando veterinarios" />
  ) : veterinariansQuery.isError ? (
    isNetworkError(veterinariansQuery.error) ? (
      <OfflineState
        actionLabel={offlineCopy.actionLabel}
        message={offlineCopy.message}
        onAction={refresh}
        testID={OFFLINE_STATE_TEST_ID}
        title={offlineCopy.title}
      />
    ) : (
      <ErrorState
        actionLabel="Reintentar"
        message={toVeterinarianErrorMessage(veterinariansQuery.error)}
        onAction={refresh}
        title="No se pudieron cargar los veterinarios"
      />
    )
  ) : (
    <EmptyState
      {...(hasFilters ? { actionLabel: 'Limpiar filtros', onAction: clearFilters } : {})}
      message={
        hasFilters
          ? 'No hay veterinarios que coincidan con los filtros seleccionados.'
          : canWrite
            ? 'Todavía no hay veterinarios registrados. Podés dar de alta uno nuevo.'
            : 'Todavía no hay veterinarios registrados.'
      }
      title="Sin veterinarios"
    />
  );

  const header = (
    <View style={styles.header}>
      <ScreenHeader subtitle="Personal veterinario registrado" title="Veterinarios" />
      <TextInput
        accessibilityLabel="Buscar veterinario por nombre o matrícula"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={handleQuickSearchChange}
        placeholder="Buscar por nombre o matrícula"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        style={styles.search}
        testID="veterinarians-search"
        value={quickSearch}
      />
      <SegmentedControl<VeterinarianStatusFilter>
        accessibilityLabel="Filtrar por estado"
        onChange={setStatus}
        options={STATUS_OPTIONS}
        testID="veterinarians-status"
        value={status}
      />
      <View style={styles.filterActions}>
        <AppButton
          icon="filter"
          label="Filtros"
          onPress={openFilterSheet}
          testID="veterinarians-open-filters"
          variant="secondary"
        />
        {hasFilters ? (
          <AppButton
            label="Limpiar"
            onPress={clearFilters}
            testID="veterinarians-clear-filters"
            variant="ghost"
          />
        ) : null}
      </View>
      {veterinarians.length > 0 ? (
        <SectionHeader
          subtitle={`${total} ${total === 1 ? 'registrado' : 'registrados'}`}
          title="Profesionales"
        />
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <DecorativeBackground variant="texture" />
      <FlatList
        {...virtualizedListPerformanceProps}
        contentContainerStyle={styles.list}
        data={veterinarians}
        keyExtractor={(veterinarian) => veterinarian.id}
        ListEmptyComponent={listState}
        ListFooterComponent={
          veterinarians.length === 0 ? null : veterinariansQuery.isFetchingNextPage ? (
            <LoadingState label="Cargando más veterinarios" />
          ) : veterinariansQuery.isFetchNextPageError ? (
            <View style={styles.paginationState}>
              <AppText color="danger">No pudimos cargar más veterinarios.</AppText>
              <AppButton label="Reintentar carga" onPress={loadMore} variant="secondary" />
            </View>
          ) : veterinariansQuery.hasNextPage ? (
            <AppButton
              label="Cargar más veterinarios"
              onPress={loadMore}
              testID="veterinarians-load-more"
              variant="secondary"
            />
          ) : (
            <AppText
              color="textSecondary"
              style={styles.endOfList}
              testID="veterinarians-end-of-list"
            >
              No hay más veterinarios
            </AppText>
          )
        }
        ListHeaderComponent={header}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={refresh}
            refreshing={veterinariansQuery.isRefetching && !veterinariansQuery.isFetchingNextPage}
            tintColor={colors.positive}
          />
        }
        renderItem={renderItem}
        testID="veterinarians-list"
      />
      {canWrite ? (
        <FAB
          accessibilityHint="Abre el formulario para dar de alta un veterinario"
          accessibilityLabel="Nuevo veterinario"
          bottomOffset={spacing.lg}
          onPress={() => router.push('/veterinarians/new' as Href)}
          testID="veterinarians-create"
        />
      ) : null}
      <VeterinarianFilterSheet
        licenseNumber={filterDraft.licenseNumber}
        name={filterDraft.name}
        onApply={applyAdvancedFilters}
        onChangeLicenseNumber={(value) =>
          setFilterDraft((draft) => ({ ...draft, licenseNumber: value }))
        }
        onChangeName={(value) => setFilterDraft((draft) => ({ ...draft, name: value }))}
        onClear={clearFilters}
        onClose={() => setFilterSheetVisible(false)}
        visible={filterSheetVisible}
      />
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
  container: { backgroundColor: colors.background, flex: 1 },
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  filterActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  list: {
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: sizes.fab + spacing['2xl'] + spacing.lg,
  },
  paginationState: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
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
