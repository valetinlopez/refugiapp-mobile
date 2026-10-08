import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomSheet,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
} from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { DecorativeBackground, SegmentedControl } from '@/components/patterns';
import { AppButton, AppIcon, AppText, FAB } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, radii, sizes, spacing } from '@/theme';

import { useCareTaskAnimals } from '../hooks/useCareTaskAnimals';
import {
  flattenCareTaskPages,
  useCareTaskCounts,
  useInfiniteCareTasks,
} from '../hooks/useCareTasks';
import type { AnimalOption, CareTask, CareTaskStatus } from '../types';
import { CareTaskOverviewCard } from './CareTaskOverviewCard';

const STATUS_OPTIONS: readonly { id: CareTaskStatus; label: string }[] = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'completed', label: 'Completadas' },
  { id: 'cancelled', label: 'Canceladas' },
];

export interface CareTasksOverviewScreenProps {
  initialAnimalId?: string | undefined;
  initialAnimalName?: string | undefined;
}

export function CareTasksOverviewScreen({
  initialAnimalId,
  initialAnimalName,
}: CareTasksOverviewScreenProps) {
  const insets = useSafeAreaInsets();
  const { canEditAnimal: canWrite } = useCapabilities();
  const [status, setStatus] = useState<CareTaskStatus>('pending');
  const [animalId, setAnimalId] = useState<string | undefined>(initialAnimalId);
  const [animalFilterVisible, setAnimalFilterVisible] = useState(false);
  const animalsQuery = useCareTaskAnimals(animalId);
  const countsQuery = useCareTaskCounts(animalId);
  const tasksQuery = useInfiniteCareTasks({
    status,
    ...(animalId !== undefined ? { animalId } : {}),
  });
  const tasks = useMemo(
    () => flattenCareTaskPages(tasksQuery.data?.pages),
    [tasksQuery.data?.pages]
  );
  const animalsById = useMemo(
    () => new Map(animalsQuery.data?.map((animal) => [animal.id, animal]) ?? []),
    [animalsQuery.data]
  );
  const selectedAnimalName =
    animalId === undefined
      ? undefined
      : (animalsById.get(animalId)?.name ??
        (animalId === initialAnimalId ? initialAnimalName : undefined));
  const statusOptions = STATUS_OPTIONS.map((option) => ({
    ...option,
    label: `${option.label} ${countsQuery.counts[option.id] ?? '…'}`,
  }));

  const openTask = useCallback((task: CareTask) => {
    router.push({ pathname: '/care-tasks/[id]', params: { id: task.id } });
  }, []);
  const renderTask = useCallback(
    ({ item }: { item: CareTask }) => (
      <CareTaskOverviewCard
        animalName={animalsById.get(item.animalId)?.name ?? 'Animal'}
        onPress={() => openTask(item)}
        profilePhotoMediaId={animalsById.get(item.animalId)?.profilePhotoMediaId}
        task={item}
      />
    ),
    [animalsById, openTask]
  );
  const loadMore = useCallback(() => {
    if (tasksQuery.hasNextPage && !tasksQuery.isFetchingNextPage) {
      void tasksQuery.fetchNextPage();
    }
  }, [tasksQuery]);
  const refresh = useCallback(() => {
    void Promise.all([tasksQuery.refetch(), countsQuery.refetch()]);
  }, [countsQuery, tasksQuery]);
  const selectAnimal = useCallback((nextAnimalId: string | undefined) => {
    setAnimalId(nextAnimalId);
    setAnimalFilterVisible(false);
  }, []);

  const listState = tasksQuery.isPending ? (
    <LoadingState label="Cargando tareas" />
  ) : tasksQuery.isError ? (
    isNetworkError(tasksQuery.error) ? (
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
        message="No pudimos cargar las tareas de cuidado."
        onAction={refresh}
        title="No se pudieron cargar las tareas"
      />
    )
  ) : (
    <EmptyState
      message={
        animalId === undefined
          ? `No hay tareas ${statusLabel(status).toLowerCase()} en el refugio.`
          : `No hay tareas ${statusLabel(status).toLowerCase()} para este animal.`
      }
      title="Sin tareas"
    />
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <DecorativeBackground variant="texture" />
      <FlatList
        {...virtualizedListPerformanceProps}
        contentContainerStyle={styles.list}
        data={tasks}
        keyExtractor={(task) => task.id}
        ListEmptyComponent={listState}
        ListFooterComponent={
          tasks.length === 0 ? null : tasksQuery.isFetchingNextPage ? (
            <LoadingState label="Cargando más tareas" />
          ) : tasksQuery.isFetchNextPageError ? (
            <View style={styles.paginationState}>
              <AppText color="danger">No pudimos cargar más tareas.</AppText>
              <AppButton label="Reintentar carga" onPress={loadMore} variant="secondary" />
            </View>
          ) : tasksQuery.hasNextPage ? (
            <AppButton
              label="Cargar más tareas"
              onPress={loadMore}
              testID="care-tasks-load-more"
              variant="secondary"
            />
          ) : (
            <AppText color="textSecondary" style={styles.endOfList} testID="task-end-of-list">
              No hay más tareas
            </AppText>
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.heading}>
              <AppText accessibilityRole="header" variant="display">
                Cuidados
              </AppText>
              <AppText accessibilityLiveRegion="polite" color="textSecondary" variant="heading3">
                {countsQuery.counts.pending ?? '…'} tareas pendientes
              </AppText>
            </View>
            <SegmentedControl<CareTaskStatus>
              accessibilityLabel="Filtrar tareas por estado"
              onChange={setStatus}
              options={statusOptions}
              testID="task-filter"
              value={status}
            />
            <AppButton
              disabled={animalsQuery.isPending}
              icon="paw"
              label={selectedAnimalName ?? 'Todos los animales'}
              onPress={() => setAnimalFilterVisible(true)}
              testID="task-animal-filter"
              variant="secondary"
            />
            {countsQuery.isError ? (
              <View style={styles.inlineError}>
                <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
                  No pudimos actualizar los contadores.
                </AppText>
                <AppButton
                  label="Reintentar contadores"
                  onPress={() => void countsQuery.refetch()}
                  variant="ghost"
                />
              </View>
            ) : null}
            {animalsQuery.isError ? (
              <View style={styles.inlineError}>
                <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
                  No pudimos cargar el filtro de animales.
                </AppText>
                <AppButton
                  label="Reintentar animales"
                  onPress={() => void animalsQuery.refetch()}
                  variant="ghost"
                />
              </View>
            ) : null}
            {!canWrite ? (
              <AppText color="textSecondary" variant="caption">
                Tu rol permite consultar tareas. La creación y los cambios están restringidos.
              </AppText>
            ) : null}
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={refresh}
            refreshing={tasksQuery.isRefetching && !tasksQuery.isFetchingNextPage}
            tintColor={colors.positive}
          />
        }
        renderItem={renderTask}
        testID="task-list"
      />
      {canWrite ? (
        <FAB
          accessibilityHint="Abre el formulario para registrar una tarea"
          accessibilityLabel="Nueva tarea"
          bottomOffset={
            insets.bottom + sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + spacing.md
          }
          onPress={() =>
            router.push({ pathname: '/care-tasks/new', params: animalId ? { animalId } : {} })
          }
          testID="care-task-create"
        />
      ) : null}
      <AnimalFilterSheet
        animals={animalsQuery.data ?? []}
        onClose={() => setAnimalFilterVisible(false)}
        onSelect={selectAnimal}
        selectedAnimalId={animalId}
        visible={animalFilterVisible}
      />
    </SafeAreaView>
  );
}

function AnimalFilterSheet({
  animals,
  onClose,
  onSelect,
  selectedAnimalId,
  visible,
}: {
  animals: AnimalOption[];
  onClose(): void;
  onSelect(animalId: string | undefined): void;
  selectedAnimalId: string | undefined;
  visible: boolean;
}) {
  return (
    <BottomSheet
      closeAccessibilityLabel="Cerrar filtro de animales"
      onClose={onClose}
      testID="task-animal-filter-sheet"
      title="Filtrar por animal"
      visible={visible}
    >
      <View accessibilityLabel="Animales" accessibilityRole="radiogroup" style={styles.options}>
        <AnimalFilterOption
          label="Todos los animales"
          onPress={() => onSelect(undefined)}
          selected={selectedAnimalId === undefined}
        />
        {animals.map((animal) => (
          <AnimalFilterOption
            key={animal.id}
            label={animal.name}
            onPress={() => onSelect(animal.id)}
            selected={selectedAnimalId === animal.id}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

function AnimalFilterOption({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress(): void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      hitSlop={sizes.hitSlop}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <AppText style={styles.optionLabel} variant={selected ? 'bodyStrong' : 'body'}>
        {label}
      </AppText>
      {selected ? <AppIcon color="positive" name="check" /> : null}
    </Pressable>
  );
}

function statusLabel(status: CareTaskStatus): string {
  return STATUS_OPTIONS.find((option) => option.id === status)?.label ?? 'Pendientes';
}

const styles = StyleSheet.create({
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  header: { gap: spacing.md, marginBottom: spacing.md },
  heading: { gap: spacing.xxs },
  inlineError: { alignItems: 'flex-start', gap: spacing.xxs },
  list: {
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom:
      sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + sizes.fab + spacing.xl,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionLabel: { flex: 1 },
  optionSelected: { borderColor: colors.positive },
  options: { gap: spacing.xs },
  paginationState: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
