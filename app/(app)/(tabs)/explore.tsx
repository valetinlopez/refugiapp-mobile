import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { FilterChip } from '@/components/patterns';
import { AppButton, AppText } from '@/components/primitives';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { AnimalCard } from '@/features/animals/components/AnimalCard';
import { useAnimals } from '@/features/animals/hooks/useAnimals';
import type { Animal, AnimalSex, AnimalStatus } from '@/features/animals/types';
import { ANIMAL_STATUS_ORDER, getStatusLabel } from '@/features/animals/utils/animalTransitions';
import { colors, radii, sizes, spacing } from '@/theme';

const SEARCH_DEBOUNCE_MS = 400;
const SEX_OPTIONS: { label: string; value: AnimalSex }[] = [
  { label: 'Hembra', value: 'female' },
  { label: 'Macho', value: 'male' },
  { label: 'Desconocido', value: 'unknown' },
];

export default function AnimalsScreen() {
  const { canEditAnimal: canWrite } = useCapabilities();
  const [searchInput, setSearchInput] = useState('');
  const [speciesInput, setSpeciesInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnimalStatus | undefined>(undefined);
  const [sexFilter, setSexFilter] = useState<AnimalSex | undefined>(undefined);
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const species = useDebouncedValue(speciesInput, SEARCH_DEBOUNCE_MS);

  const filters = useMemo(
    () => ({
      ...(statusFilter !== undefined ? { status: statusFilter } : {}),
      ...(sexFilter !== undefined ? { sex: sexFilter } : {}),
      ...(species.trim() !== '' ? { species: species.trim() } : {}),
      ...(search.trim() !== '' ? { name: search.trim() } : {}),
    }),
    [search, sexFilter, species, statusFilter]
  );
  const animalsQuery = useAnimals(filters);

  const animals = useMemo(
    () => animalsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [animalsQuery.data]
  );

  const handleAnimalPress = useCallback((animal: Animal) => {
    router.push({ pathname: '/animals/[id]', params: { id: animal.id } });
  }, []);

  const renderAnimal = useCallback<ListRenderItem<Animal>>(
    ({ item }) => <AnimalCard animal={item} onPress={handleAnimalPress} />,
    [handleAnimalPress]
  );

  const handleEndReached = useCallback(() => {
    if (animalsQuery.hasNextPage && !animalsQuery.isFetchingNextPage) {
      void animalsQuery.fetchNextPage();
    }
  }, [animalsQuery]);

  const handleRefresh = useCallback(() => {
    void animalsQuery.refetch();
  }, [animalsQuery]);

  const header = (
    <View style={styles.header}>
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <AppText variant="heading1">Animales</AppText>
          <AppText color="textSecondary">Todos los animales del refugio</AppText>
        </View>
        {canWrite ? (
          <AppButton
            icon="paw"
            label="Alta"
            onPress={() => router.push('/animals/new')}
            variant="secondary"
          />
        ) : null}
      </View>
      <TextInput
        accessibilityLabel="Buscar animal"
        autoCapitalize="none"
        onChangeText={setSearchInput}
        placeholder="Buscar por nombre"
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
        testID="animal-search"
        value={searchInput}
      />
      <TextInput
        accessibilityLabel="Filtrar por especie"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setSpeciesInput}
        placeholder="Especie (ej. dog)"
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
        testID="animal-species"
        value={speciesInput}
      />
      <StatusFilter selected={statusFilter} onSelect={setStatusFilter} />
      <SexFilter selected={sexFilter} onSelect={setSexFilter} />
      <AppText accessibilityLiveRegion="polite" color="textSecondary" variant="caption">
        {animalsQuery.isSuccess ? `${animalsQuery.data?.pages[0]?.total ?? 0} animales` : ' '}
      </AppText>
    </View>
  );

  if (animalsQuery.isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.state}>
          <LoadingState label="Cargando animales" />
        </View>
      </SafeAreaView>
    );
  }

  if (animalsQuery.isError && animalsQuery.data === undefined) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.state}>
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar los animales. Revisá tu conexión."
            onAction={() => void animalsQuery.refetch()}
            title="No se pudieron cargar los animales"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        {...virtualizedListPerformanceProps}
        contentContainerStyle={styles.list}
        data={animals}
        keyExtractor={(animal) => animal.id}
        ListEmptyComponent={
          <EmptyState
            message={
              canWrite
                ? 'No hay animales que coincidan. Podés dar de alta uno nuevo.'
                : 'No hay animales que coincidan con tu búsqueda.'
            }
            title="Sin animales"
          />
        }
        ListFooterComponent={
          animalsQuery.isFetchingNextPage ? (
            <LoadingState label="Cargando más animales" />
          ) : animalsQuery.isFetchNextPageError ? (
            <View style={styles.paginationError}>
              <AppText color="danger">No pudimos cargar más animales.</AppText>
              <AppButton
                label="Reintentar carga"
                onPress={() => void animalsQuery.fetchNextPage()}
                variant="secondary"
              />
            </View>
          ) : null
        }
        ListHeaderComponent={header}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        onRefresh={handleRefresh}
        refreshing={animalsQuery.isRefetching}
        renderItem={renderAnimal}
        testID="animals-list"
      />
    </SafeAreaView>
  );
}

function SexFilter({
  onSelect,
  selected,
}: {
  onSelect(sex: AnimalSex | undefined): void;
  selected: AnimalSex | undefined;
}) {
  return (
    <View style={styles.filterGroup}>
      <AppText variant="label">Sexo</AppText>
      <ScrollView
        accessibilityLabel="Filtrar por sexo"
        contentContainerStyle={styles.filters}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <FilterChip
          label="Todos"
          onPress={() => onSelect(undefined)}
          selected={selected === undefined}
        />
        {SEX_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            onPress={() => onSelect(selected === option.value ? undefined : option.value)}
            selected={selected === option.value}
          />
        ))}
      </ScrollView>
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

function StatusFilter({
  onSelect,
  selected,
}: {
  onSelect(status: AnimalStatus | undefined): void;
  selected: AnimalStatus | undefined;
}) {
  return (
    <View style={styles.filterGroup}>
      <AppText variant="label">Estado</AppText>
      <ScrollView
        accessibilityLabel="Filtrar por estado"
        contentContainerStyle={styles.filters}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <FilterChip
          label="Todos"
          onPress={() => onSelect(undefined)}
          selected={selected === undefined}
        />
        {ANIMAL_STATUS_ORDER.map((status) => (
          <FilterChip
            key={status}
            label={getStatusLabel(status)}
            onPress={() => onSelect(selected === status ? undefined : status)}
            selected={selected === status}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterGroup: { gap: spacing.xxs },
  filters: { gap: spacing.xs, paddingVertical: spacing.xs },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  heading: { flex: 1, gap: spacing.xxs },
  headingRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  list: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  safeArea: { backgroundColor: colors.background, flex: 1 },
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
  state: { flex: 1, justifyContent: 'center', padding: spacing.lg },
});
