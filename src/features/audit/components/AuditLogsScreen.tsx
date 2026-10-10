import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { DecorativeBackground, ScreenHeader, SectionHeader } from '@/components/patterns';
import { AppBadge, AppButton, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, sizes, spacing } from '@/theme';

import { useAuditLogs } from '../hooks/useAuditLogs';
import type { AuditAction, AuditFilters as AuditFilterValues, AuditResourceType } from '../types';
import {
  auditRangeError,
  buildAuditFilters,
  toAuditErrorMessage,
} from '../utils/auditPresentation';
import { AuditFilters } from './AuditFilters';
import { AuditLogCard } from './AuditLogCard';

export function AuditLogsScreen() {
  const [action, setAction] = useState<AuditAction>();
  const [resourceType, setResourceType] = useState<AuditResourceType>();
  const [actor, setActor] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState<AuditFilterValues>({});
  const [filterError, setFilterError] = useState<string | null>(null);
  const query = useAuditLogs(filters);
  const { fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = query;
  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );
  const total = query.data?.pages[0]?.total ?? 0;
  const hasFilters = Object.keys(filters).length > 0;

  function applyFilters(): void {
    const error = auditRangeError(from, to);
    setFilterError(error);
    if (!error) {
      setFilters(buildAuditFilters(action, resourceType, actor, resourceId, from, to));
    }
  }

  function clearFilters(): void {
    setAction(undefined);
    setResourceType(undefined);
    setActor('');
    setResourceId('');
    setFrom('');
    setTo('');
    setFilterError(null);
    setFilters({});
  }

  const renderEntry = useCallback(
    ({ item }: { item: (typeof entries)[number] }) => <AuditLogCard entry={item} />,
    []
  );
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const listState = query.isPending ? (
    <LoadingState label="Cargando auditoría" />
  ) : query.isError ? (
    isNetworkError(query.error) ? (
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
        message={toAuditErrorMessage(query.error)}
        onAction={refresh}
        title="No se pudo cargar la auditoría"
      />
    )
  ) : (
    <EmptyState
      {...(hasFilters ? { actionLabel: 'Limpiar filtros', onAction: clearFilters } : {})}
      message={
        hasFilters
          ? 'No hay eventos que coincidan con los filtros elegidos.'
          : 'Todavía no hay eventos de auditoría registrados.'
      }
      title="Sin eventos"
    />
  );

  return (
    <View style={styles.container}>
      <DecorativeBackground variant="texture" />
      <FlatList
        {...virtualizedListPerformanceProps}
        contentContainerStyle={styles.list}
        data={entries}
        keyExtractor={(entry) => entry.id}
        ListEmptyComponent={listState}
        ListFooterComponent={
          entries.length === 0 ? null : query.isFetchingNextPage ? (
            <LoadingState label="Cargando más eventos" />
          ) : query.isFetchNextPageError ? (
            <View style={styles.paginationState}>
              <AppText color="danger">No pudimos cargar más eventos.</AppText>
              <AppButton label="Reintentar carga" onPress={loadMore} variant="secondary" />
            </View>
          ) : hasNextPage ? (
            <AppButton
              label="Cargar más eventos"
              onPress={loadMore}
              testID="audit-load-more"
              variant="secondary"
            />
          ) : (
            <AppText color="textSecondary" style={styles.endOfList} testID="audit-end-of-list">
              No hay más eventos
            </AppText>
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader subtitle="Registro de actividad del sistema" title="Auditoría" />
            <AppBadge icon="info" label="Solo administradores" />
            <AuditFilters
              action={action}
              actor={actor}
              error={filterError}
              from={from}
              onAction={setAction}
              onActor={setActor}
              onApply={applyFilters}
              onClear={clearFilters}
              onFrom={setFrom}
              onResourceId={setResourceId}
              onResourceType={setResourceType}
              onTo={setTo}
              resourceId={resourceId}
              resourceType={resourceType}
              to={to}
            />
            {entries.length > 0 ? (
              <SectionHeader
                subtitle={`${total} ${total === 1 ? 'evento' : 'eventos'}`}
                title="Actividad reciente"
              />
            ) : null}
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={refresh}
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            tintColor={colors.positive}
          />
        }
        renderItem={renderEntry}
        testID="audit-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  header: { gap: spacing.md, marginBottom: spacing.md },
  list: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: spacing.sm,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    width: '100%',
  },
  paginationState: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
});
