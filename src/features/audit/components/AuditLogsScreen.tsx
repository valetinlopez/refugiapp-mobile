import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

import { useAuditLogs } from '../hooks/useAuditLogs';
import type { AuditAction, AuditFilters as AuditFilterValues } from '../types';
import {
  auditRangeError,
  buildAuditFilters,
  toAuditErrorMessage,
} from '../utils/auditPresentation';
import { AuditFilters } from './AuditFilters';
import { AuditLogCard } from './AuditLogCard';

export function AuditLogsScreen() {
  const [action, setAction] = useState<AuditAction>();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState<AuditFilterValues>({});
  const [filterError, setFilterError] = useState<string | null>(null);
  const query = useAuditLogs(filters);
  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  function applyFilters(): void {
    const error = auditRangeError(from, to);
    setFilterError(error);
    if (!error) setFilters(buildAuditFilters(action, from, to));
  }

  function clearFilters(): void {
    setAction(undefined);
    setFrom('');
    setTo('');
    setFilterError(null);
    setFilters({});
  }

  if (query.isPending) return <LoadingState label="Cargando auditoría" />;
  if (query.isError)
    return (
      <ErrorState
        actionLabel="Reintentar"
        message={toAuditErrorMessage(query.error)}
        onAction={() => void query.refetch()}
        title="No se pudo cargar la auditoría"
      />
    );

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <AppText variant="heading1">Auditoría</AppText>
        <AppText color="textSecondary">
          {query.data.pages[0]?.total ?? 0} eventos registrados
        </AppText>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={entries}
        keyExtractor={(entry) => entry.id}
        ListHeaderComponent={
          <AuditFilters
            action={action}
            error={filterError}
            from={from}
            onAction={setAction}
            onApply={applyFilters}
            onClear={clearFilters}
            onFrom={setFrom}
            onTo={setTo}
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
          query.isFetchingNextPage ? <LoadingState label="Cargando más eventos" /> : null
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={() => void query.refetch()}
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            tintColor={colors.positive}
          />
        }
        renderItem={({ item }) => <AuditLogCard entry={item} />}
        testID="audit-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, gap: spacing.md, padding: spacing.lg },
  heading: { gap: spacing.xxs },
  list: { gap: spacing.sm, paddingBottom: spacing['2xl'] },
});
