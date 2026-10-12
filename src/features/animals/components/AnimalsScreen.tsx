import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import {
  DecorativeBackground,
  FilterChip,
  ScreenHeader,
  SegmentedControl,
} from '@/components/patterns';
import { AppButton, AppText, FAB } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, radii, sizes, spacing } from '@/theme';

import { useAnimals } from '../hooks/useAnimals';
import type { Animal, AnimalListFilters, AnimalSex } from '../types';
import {
  ANIMAL_STATUS_FILTER_OPTIONS,
  describeActiveAnimalFilters,
  flattenAnimalPages,
  hasActiveAnimalFilters,
  resolveAnimalGridColumns,
  toAnimalAdvancedFilters,
  toAnimalSearchFilter,
  type ActiveAnimalFilterChip,
  type AnimalSexFilter,
  type AnimalStatusFilter,
} from '../utils/animalListPresentation';
import { AnimalFiltersSheet } from './AnimalFiltersSheet';
import { AnimalGridCard } from './AnimalGridCard';

const SEARCH_DEBOUNCE_MS = 400;

export function AnimalsScreen({ canWrite }: { canWrite: boolean }) {
  const insets = useSafeAreaInsets();
  const { fontScale, width } = useWindowDimensions();
  const numColumns = resolveAnimalGridColumns(width, fontScale);

  const [statusFilter, setStatusFilter] = useState<AnimalStatusFilter>('all');
  const [quickSearch, setQuickSearch] = useState('');
  const debouncedQuickSearch = useDebouncedValue(quickSearch, SEARCH_DEBOUNCE_MS);
  const [advancedFilters, setAdvancedFilters] = useState<AnimalListFilters>({});
  const [filterDraft, setFilterDraft] = useState<{ sex: AnimalSexFilter; species: string }>({
    sex: 'all',
    species: '',
  });
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const searchFilters = useMemo<AnimalListFilters>(() => {
    if (advancedFilters.species !== undefined || advancedFilters.sex !== undefined) {
      return advancedFilters;
    }
    return toAnimalSearchFilter(debouncedQuickSearch);
  }, [advancedFilters, debouncedQuickSearch]);

  const filters = useMemo<AnimalListFilters>(
    () => ({
      ...searchFilters,
      ...(statusFilter === 'all' ? {} : { status: statusFilter }),
    }),
    [searchFilters, statusFilter]
  );

  const animalsQuery = useAnimals(filters);
  const animals = useMemo(
    () => flattenAnimalPages(animalsQuery.data?.pages),
    [animalsQuery.data?.pages]
  );
  const total = animalsQuery.data?.pages[0]?.total ?? 0;
  const hasFilters = hasActiveAnimalFilters(filters, statusFilter);
  const activeChips = useMemo(
    () => describeActiveAnimalFilters(filters, statusFilter),
    [filters, statusFilter]
  );

  const handleAnimalPress = useCallback((animal: Animal) => {
    router.push({ pathname: '/animals/[id]', params: { id: animal.id } });
  }, []);

  const renderAnimal = useCallback<ListRenderItem<Animal>>(
    ({ item }) => (
      <View style={styles.cell}>
        <AnimalGridCard animal={item} onPress={handleAnimalPress} />
      </View>
    ),
    [handleAnimalPress]
  );

  const loadMore = useCallback(() => {
    if (animalsQuery.hasNextPage && !animalsQuery.isFetchingNextPage) {
      void animalsQuery.fetchNextPage();
    }
  }, [animalsQuery]);

  const retryNextPage = useCallback(() => {
    void animalsQuery.fetchNextPage();
  }, [animalsQuery]);

  const refresh = useCallback(() => {
    void animalsQuery.refetch();
  }, [animalsQuery]);

  const handleQuickSearchChange = useCallback((value: string) => {
    setQuickSearch(value);
    if (value.trim() !== '') setAdvancedFilters({});
  }, []);

  const clearSearch = useCallback(() => {
    setQuickSearch('');
  }, []);

  const openFilterSheet = useCallback(() => {
    setFilterDraft({
      sex: advancedFilters.sex ?? 'all',
      species: advancedFilters.species ?? '',
    });
    setFilterSheetVisible(true);
  }, [advancedFilters]);

  const applyAdvancedFilters = useCallback(() => {
    const sex: AnimalSex | undefined = filterDraft.sex === 'all' ? undefined : filterDraft.sex;
    setAdvancedFilters(toAnimalAdvancedFilters(filterDraft.species, sex));
    setQuickSearch('');
    setFilterSheetVisible(false);
  }, [filterDraft]);

  const clearFilters = useCallback(() => {
    setStatusFilter('all');
    setQuickSearch('');
    setAdvancedFilters({});
    setFilterDraft({ sex: 'all', species: '' });
  }, []);

  const removeFilter = useCallback((chip: ActiveAnimalFilterChip) => {
    if (chip.key === 'status') {
      setStatusFilter('all');
      return;
    }
    if (chip.key === 'name') {
      setQuickSearch('');
      return;
    }
    setAdvancedFilters((previous) => {
      const next = { ...previous };
      delete next[chip.key];
      return next;
    });
  }, []);

  const listState = animalsQuery.isPending ? (
    <LoadingState label="Cargando animales" />
  ) : animalsQuery.isError ? (
    isNetworkError(animalsQuery.error) ? (
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
        message="No pudimos cargar los animales. Revisá tu conexión."
        onAction={refresh}
        title="No se pudieron cargar los animales"
      />
    )
  ) : (
    <EmptyState
      {...(hasFilters ? { actionLabel: 'Limpiar filtros', onAction: clearFilters } : {})}
      message={
        hasFilters
          ? 'No hay animales que coincidan con los filtros seleccionados.'
          : canWrite
            ? 'No hay animales que coincidan. Podés dar de alta uno nuevo.'
            : 'No hay animales que coincidan con tu búsqueda.'
      }
      title="Sin animales"
    />
  );

  const header = (
    <View style={styles.header}>
      <ScreenHeader
        subtitle={`${total} ${total === 1 ? 'animal registrado' : 'animales registrados'}`}
        title="Animales"
      />
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Buscar animal"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={handleQuickSearchChange}
          placeholder="Buscar por nombre"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          style={styles.search}
          testID="animal-search"
          value={quickSearch}
        />
        {quickSearch !== '' ? (
          <AppButton
            accessibilityLabel="Limpiar búsqueda"
            icon="close"
            label=""
            onPress={clearSearch}
            testID="animals-search-clear"
            variant="ghost"
          />
        ) : null}
      </View>
      <SegmentedControl<AnimalStatusFilter>
        accessibilityLabel="Filtrar por estado"
        onChange={setStatusFilter}
        options={ANIMAL_STATUS_FILTER_OPTIONS}
        testID="animals-status-filter"
        value={statusFilter}
      />
      <View style={styles.filterActions}>
        <AppButton
          icon="filter"
          label="Filtros"
          onPress={openFilterSheet}
          testID="animals-open-filters"
          variant="secondary"
        />
        {hasFilters ? (
          <AppButton
            label="Limpiar filtros"
            onPress={clearFilters}
            testID="animals-clear-filters"
            variant="ghost"
          />
        ) : null}
      </View>
      {activeChips.length > 0 ? (
        <ScrollView
          accessibilityLabel="Filtros activos"
          contentContainerStyle={styles.activeFilters}
          horizontal
          showsHorizontalScrollIndicator={false}
          testID="animals-active-filters"
        >
          {activeChips.map((chip) => (
            <FilterChip
              accessibilityLabel={`Quitar filtro: ${chip.label}`}
              icon="close"
              key={chip.key}
              label={chip.label}
              onPress={() => removeFilter(chip)}
              selected
              testID={`animals-remove-filter-${chip.key}`}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <DecorativeBackground variant="texture" />
      <FlatList
        {...virtualizedListPerformanceProps}
        columnWrapperStyle={numColumns > 1 ? styles.columns : undefined}
        contentContainerStyle={styles.list}
        data={animals}
        key={numColumns}
        keyExtractor={(animal) => animal.id}
        ListEmptyComponent={listState}
        ListFooterComponent={
          animals.length === 0 ? null : animalsQuery.isFetchingNextPage ? (
            <LoadingState label="Cargando más animales" />
          ) : animalsQuery.isFetchNextPageError ? (
            <View style={styles.paginationState}>
              <AppText color="danger">No pudimos cargar más animales.</AppText>
              <AppButton label="Reintentar carga" onPress={retryNextPage} variant="secondary" />
            </View>
          ) : animalsQuery.hasNextPage ? (
            <AppButton
              label="Cargar más animales"
              onPress={loadMore}
              testID="animals-load-more"
              variant="secondary"
            />
          ) : (
            <AppText color="textSecondary" style={styles.endOfList} testID="animals-end-of-list">
              No hay más animales
            </AppText>
          )
        }
        ListHeaderComponent={header}
        numColumns={numColumns}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={refresh}
            refreshing={animalsQuery.isRefetching && !animalsQuery.isFetchingNextPage}
            tintColor={colors.positive}
          />
        }
        renderItem={renderAnimal}
        testID="animals-list"
      />
      {canWrite ? (
        <FAB
          accessibilityHint="Abre el formulario para dar de alta un animal"
          accessibilityLabel="Dar de alta un animal"
          bottomOffset={
            insets.bottom + sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + spacing.md
          }
          onPress={() => router.push('/animals/new')}
          testID="animals-create"
        />
      ) : null}
      <AnimalFiltersSheet
        onApply={applyAdvancedFilters}
        onChangeSex={(sex) => setFilterDraft((draft) => ({ ...draft, sex }))}
        onChangeSpecies={(species) => setFilterDraft((draft) => ({ ...draft, species }))}
        onClear={clearFilters}
        onClose={() => setFilterSheetVisible(false)}
        sex={filterDraft.sex}
        species={filterDraft.species}
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
  activeFilters: {
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
  columns: {
    gap: spacing.sm,
  },
  container: { backgroundColor: colors.background, flex: 1 },
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  filterActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  list: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: spacing.sm,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    paddingBottom:
      sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + sizes.fab + spacing.lg,
    width: '100%',
  },
  paginationState: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    flex: 1,
    minHeight: sizes.buttonHeight,
    minWidth: 0,
    paddingHorizontal: spacing.md,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
