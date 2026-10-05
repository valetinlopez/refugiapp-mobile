import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, spacing } from '@/theme';

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

  function applyFilters(): void {
    const error = auditRangeError(from, to);
    setFilterError(error);
    if (!error) setFilters(buildAuditFilters(action, resourceType, actor, from, to));
  }

  function clearFilters(): void {
    setAction(undefined);
    setResourceType(undefined);
    setActor('');
    setFrom('');
    setTo('');
    setFilterError(null);
    setFilters({});
  }

  const renderEntry = useCallback(
    ({ item }: { item: (typeof entries)[number] }) => <AuditLogCard entry={item} />,
    []
  );
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (query.isPending) return <LoadingState label="Cargando auditoría" />;
  if (query.isError) {
    if (isNetworkError(query.error)) {
      return (
        <OfflineState
          actionLabel={offlineCopy.actionLabel}
          message={offlineCopy.message}
          onAction={() => void query.refetch()}
          testID={OFFLINE_STATE_TEST_ID}
          title={offlineCopy.title}
        />
      );
    }
    return (
      <ErrorState
        actionLabel="Reintentar"
        message={toAuditErrorMessage(query.error)}
        onAction={() => void query.refetch()}
        title="No se pudo cargar la auditoría"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <AppText variant="heading1">Auditoría</AppText>
        <AppText color="textSecondary">
          {query.data.pages[0]?.total ?? 0} eventos registrados
        </AppText>
      </View>
      <FlatList
        {...virtualizedListPerformanceProps}
        contentContainerStyle={styles.list}
        data={entries}
        keyExtractor={(entry) => entry.id}
        ListHeaderComponent={
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
            onResourceType={setResourceType}
            onTo={setTo}
            resourceType={resourceType}
            to={to}
          />
        }
        ListEmptyComponent={
          <EmptyState
            message="No hay eventos que coincidan con los filtros elegidos."
            title="Sin eventos"
          />
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <LoadingState label="Cargando más eventos" />
          ) : !hasNextPage && entries.length > 0 ? (
            <AppText color="textSecondary" style={styles.endOfList}>
              No hay más eventos
            </AppText>
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={handleRefresh}
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
  container: { backgroundColor: colors.background, flex: 1, gap: spacing.md, padding: spacing.lg },
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  heading: { gap: spacing.xxs },
  list: { gap: spacing.sm, paddingBottom: spacing['2xl'] },
});
