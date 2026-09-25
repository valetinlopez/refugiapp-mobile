import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { FilterChip } from '@/components/patterns';
import { AppButton, AppText } from '@/components/primitives';
import { useSession } from '@/features/auth/session';
import { AnimalCard } from '@/features/animals/components/AnimalCard';
import { useAnimals } from '@/features/animals/hooks/useAnimals';
import { useSpecies } from '@/features/animals/hooks/useSpecies';
import type { AnimalStatus } from '@/features/animals/types';
import { ANIMAL_STATUS_ORDER, getStatusLabel } from '@/features/animals/utils/animalTransitions';
import { toSpeciesOptions } from '@/features/animals/utils/speciesCatalog';
import { colors, radii, sizes, spacing } from '@/theme';

export default function AnimalsScreen() {
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnimalStatus | undefined>(undefined);
  const [speciesFilter, setSpeciesFilter] = useState<string | undefined>(undefined);
  const search = useDebouncedValue(searchInput, 300);

  const animalsQuery = useAnimals({
    ...(statusFilter !== undefined ? { status: statusFilter } : {}),
    ...(speciesFilter !== undefined ? { species: speciesFilter } : {}),
    ...(search.trim() !== '' ? { name: search.trim() } : {}),
  });

  const animals = animalsQuery.data?.pages.flatMap((page) => page.items) ?? [];

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
        value={searchInput}
      />
      <StatusFilter selected={statusFilter} onSelect={setStatusFilter} />
      <SpeciesFilter selected={speciesFilter} onSelect={setSpeciesFilter} />
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

  if (animalsQuery.isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.state}>
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar los animales. Revisa tu conexión."
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
          animalsQuery.isFetchingNextPage ? <LoadingState label="Cargando más animales" /> : null
        }
        ListHeaderComponent={header}
        onEndReached={() => {
          if (animalsQuery.hasNextPage) void animalsQuery.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        onRefresh={() => void animalsQuery.refetch()}
        refreshing={animalsQuery.isRefetching}
        renderItem={({ item }) => (
          <AnimalCard
            animal={item}
            onPress={(animal) =>
              router.push({ pathname: '/animals/[id]', params: { id: animal.id } })
            }
          />
        )}
      />
    </SafeAreaView>
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
    <ScrollView
      accessibilityLabel="Filtrar por estado"
      contentContainerStyle={styles.filters}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <FilterChip
        label="Todas"
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
  );
}

function SpeciesFilter({
  onSelect,
  selected,
}: {
  onSelect(species: string | undefined): void;
  selected: string | undefined;
}) {
  const speciesQuery = useSpecies();
  if (!speciesQuery.isSuccess) {
    return null;
  }
  const options = toSpeciesOptions(speciesQuery.data);
  if (options.length === 0) {
    return null;
  }
  return (
    <ScrollView
      accessibilityLabel="Filtrar por especie"
      contentContainerStyle={styles.filters}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <FilterChip
        label="Todas"
        onPress={() => onSelect(undefined)}
        selected={selected === undefined}
      />
      {options.map((option) => (
        <FilterChip
          key={option.value}
          label={option.label}
          onPress={() => onSelect(selected === option.value ? undefined : option.value)}
          selected={selected === option.value}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
