import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { FilterChip } from '@/components/patterns';
import { AppButton, AppCard, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, sizes, spacing } from '@/theme';

import { flattenAnimalHistoryPages, useAnimalHistory } from '../hooks/useAnimalHistory';
import type { AnimalHistoryEvent, AnimalHistoryEventType } from '../types';
import {
  ANIMAL_HISTORY_EVENT_TYPES,
  getAnimalEventTypeLabel,
} from '../utils/animalHistoryPresentation';
import { AnimalHistoryTimelineItem } from './AnimalHistoryTimelineItem';

type AnimalHistoryFilter = 'all' | AnimalHistoryEventType;

export interface AnimalHistoryProps {
  animalId: string;
  canCreateEvent?: boolean;
  header?: ReactNode;
  onCreateEvent?(): void;
}

export function AnimalHistory({
  animalId,
  canCreateEvent = false,
  header,
  onCreateEvent,
}: AnimalHistoryProps) {
  const [filter, setFilter] = useState<AnimalHistoryFilter>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const filters = filter === 'all' ? {} : { eventType: filter };
  const eventsQuery = useAnimalHistory(animalId, filters);
  const { fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = eventsQuery;
  const events = useMemo(
    () => flattenAnimalHistoryPages(eventsQuery.data?.pages),
    [eventsQuery.data?.pages]
  );

  const renderEvent = useCallback(
    ({ index, item }: { index: number; item: AnimalHistoryEvent }) => (
      <AnimalHistoryTimelineItem
        event={item}
        isFirst={index === 0}
        isLast={index === events.length - 1}
      />
    ),
    [events.length]
  );
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const emptyState = eventsQuery.isPending ? (
    <LoadingState label="Cargando historial" />
  ) : eventsQuery.isError ? (
    isNetworkError(eventsQuery.error) ? (
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
        message="No pudimos cargar el historial del animal."
        onAction={refresh}
        title="No se pudo cargar el historial"
      />
    )
  ) : (
    <EmptyState
      message={
        filter === 'all'
          ? 'Todavía no hay eventos registrados para este animal.'
          : 'No hay eventos que coincidan con el filtro elegido.'
      }
      title="Sin historial"
    />
  );

  return (
    <FlatList
      {...virtualizedListPerformanceProps}
      contentContainerStyle={styles.list}
      data={events}
      keyExtractor={(event) => event.id}
      ListEmptyComponent={emptyState}
      ListFooterComponent={
        events.length === 0 ? null : isFetchingNextPage ? (
          <LoadingState label="Cargando más eventos" />
        ) : hasNextPage ? (
          <AppButton
            label="Cargar más eventos"
            onPress={loadMore}
            testID="animal-history-load-more"
            variant="secondary"
          />
        ) : (
          <AppText color="textSecondary" style={styles.endOfList} testID="history-end-of-list">
            No hay más eventos
          </AppText>
        )
      }
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <AppCard style={styles.controls} variant="organic">
            <View style={styles.headingRow}>
              <View style={styles.headingCopy}>
                <AppText accessibilityRole="header" variant="heading1">
                  Historial
                </AppText>
                <AppText color="textSecondary">
                  {eventsQuery.data?.pages[0]?.total ?? 0} eventos registrados
                </AppText>
              </View>
              {canCreateEvent && onCreateEvent ? (
                <AppButton
                  icon="add"
                  label="Agregar evento"
                  onPress={onCreateEvent}
                  testID="animal-history-add"
                />
              ) : null}
            </View>
            <AppButton
              accessibilityState={{ expanded: filtersExpanded }}
              icon="filter"
              label={filter === 'all' ? 'Todos los eventos' : getAnimalEventTypeLabel(filter)}
              onPress={() => setFiltersExpanded((current) => !current)}
              testID="animal-history-filter-toggle"
              variant="secondary"
            />
            {filtersExpanded ? (
              <View
                accessibilityLabel="Filtrar historial por tipo"
                accessibilityRole="radiogroup"
                style={styles.filters}
              >
                <FilterChip
                  accessibilityRole="radio"
                  label="Todos"
                  onPress={() => {
                    setFilter('all');
                    setFiltersExpanded(false);
                  }}
                  selected={filter === 'all'}
                  testID="animal-history-filter-all"
                />
                {ANIMAL_HISTORY_EVENT_TYPES.map((eventType) => (
                  <FilterChip
                    accessibilityRole="radio"
                    key={eventType}
                    label={getAnimalEventTypeLabel(eventType)}
                    onPress={() => {
                      setFilter(eventType);
                      setFiltersExpanded(false);
                    }}
                    selected={filter === eventType}
                    testID={`animal-history-filter-${eventType}`}
                  />
                ))}
              </View>
            ) : null}
          </AppCard>
        </View>
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          colors={[colors.positive]}
          onRefresh={refresh}
          refreshing={eventsQuery.isRefetching && !isFetchingNextPage}
          tintColor={colors.positive}
        />
      }
      renderItem={renderEvent}
      testID="animal-history-list"
    />
  );
}

const styles = StyleSheet.create({
  controls: { gap: spacing.md },
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  header: { gap: spacing.lg },
  headingCopy: { flex: 1, gap: spacing.xxs, minWidth: sizes.avatarXl },
  headingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  list: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});
