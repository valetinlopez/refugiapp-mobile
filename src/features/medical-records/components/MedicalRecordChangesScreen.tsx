import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { DateTimeField, FilterChip } from '@/components/patterns';
import { AppButton, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { colors, fontFamilies, radii, sizes, spacing } from '@/theme';

import { useMedicalRecordChanges } from '../hooks/useMedicalRecordChanges';
import type { MedicalRecordChangeFilters, MedicalRecordChangeType } from '../types';
import {
  changeRangeError,
  buildChangeFilters,
  getChangeTypeLabel,
  MEDICAL_RECORD_CHANGE_TYPES,
  toChangeErrorMessage,
} from '../utils/medicalRecordChangePresentation';
import { MedicalRecordChangeCard } from './MedicalRecordChangeCard';

export interface MedicalRecordChangesScreenProps {
  recordId: string;
}

export function MedicalRecordChangesScreen({ recordId }: MedicalRecordChangesScreenProps) {
  const [changeType, setChangeType] = useState<MedicalRecordChangeType | undefined>();
  const [actor, setActor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState<MedicalRecordChangeFilters>({});
  const [filterError, setFilterError] = useState<string | null>(null);

  const query = useMedicalRecordChanges(recordId, filters);
  const { fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = query;
  const entries = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  function applyFilters(): void {
    const error = changeRangeError(from, to);
    setFilterError(error);
    if (!error) setFilters(buildChangeFilters(changeType, actor, from, to));
  }

  function clearFilters(): void {
    setChangeType(undefined);
    setActor('');
    setFrom('');
    setTo('');
    setFilterError(null);
    setFilters({});
  }

  const renderEntry = useCallback(
    ({ item }: { item: (typeof entries)[number] }) => <MedicalRecordChangeCard change={item} />,
    []
  );
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (query.isPending) return <LoadingState label="Cargando historial de cambios" />;
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
        message={toChangeErrorMessage(query.error)}
        onAction={() => void query.refetch()}
        title="No se pudo cargar el historial"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <AppText variant="heading1">Historial de cambios</AppText>
        <AppText color="textSecondary">
          {query.data.pages[0]?.total ?? 0} cambios registrados
        </AppText>
      </View>
      <FlatList
        {...virtualizedListPerformanceProps}
        contentContainerStyle={styles.list}
        data={entries}
        keyExtractor={(entry) => entry.id}
        ListHeaderComponent={
          <ChangeFilters
            actor={actor}
            changeType={changeType}
            error={filterError}
            from={from}
            onActor={setActor}
            onApply={applyFilters}
            onChangeType={setChangeType}
            onClear={clearFilters}
            onFrom={setFrom}
            onTo={setTo}
            to={to}
          />
        }
        ListEmptyComponent={
          <EmptyState
            message="No hay cambios que coincidan con los filtros elegidos."
            title="Sin cambios"
          />
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <LoadingState label="Cargando más cambios" />
          ) : !hasNextPage && entries.length > 0 ? (
            <AppText color="textSecondary" style={styles.endOfList} testID="history-end-of-list">
              No hay más cambios
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
        testID="medical-record-changes-list"
      />
    </View>
  );
}

interface ChangeFiltersProps {
  actor: string;
  changeType: MedicalRecordChangeType | undefined;
  error: string | null;
  from: string;
  onActor(value: string): void;
  onApply(): void;
  onChangeType(value?: MedicalRecordChangeType): void;
  onClear(): void;
  onFrom(value: string): void;
  onTo(value: string): void;
  to: string;
}

function ChangeFilters({
  actor,
  changeType,
  error,
  from,
  onActor,
  onApply,
  onChangeType,
  onClear,
  onFrom,
  onTo,
  to,
}: ChangeFiltersProps) {
  return (
    <View style={styles.filters}>
      <AppText variant="heading3">Filtros</AppText>
      <View style={styles.chipRow}>
        <FilterChip
          label="Todas"
          onPress={() => onChangeType(undefined)}
          selected={!changeType}
          testID="history-filter-type-all"
        />
        {MEDICAL_RECORD_CHANGE_TYPES.map((value) => (
          <FilterChip
            key={value}
            label={getChangeTypeLabel(value)}
            onPress={() => onChangeType(value)}
            selected={changeType === value}
            testID={`history-filter-type-${value}`}
          />
        ))}
      </View>
      <View style={styles.field}>
        <AppText variant="label">Usuario que realizó el cambio (UUID)</AppText>
        <FilterActorInput
          accessibilityLabel="Usuario que realizó el cambio (UUID)"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onActor}
          placeholder="Ej.: 123e4567-…"
          testID="history-filter-actor"
          value={actor}
        />
      </View>
      <View style={styles.dates}>
        <View style={styles.field}>
          <AppText variant="label">Desde</AppText>
          <DateTimeField
            accessibilityLabel="Fecha desde"
            mode="date"
            onChange={onFrom}
            optional
            value={from}
          />
        </View>
        <View style={styles.field}>
          <AppText variant="label">Hasta</AppText>
          <DateTimeField
            accessibilityLabel="Fecha hasta"
            mode="date"
            onChange={onTo}
            optional
            value={to}
          />
        </View>
      </View>
      {error ? (
        <AppText accessibilityRole="alert" color="danger">
          {error}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <AppButton
          label="Limpiar"
          onPress={onClear}
          testID="history-filter-clear"
          variant="ghost"
        />
        <AppButton
          icon="refresh"
          label="Aplicar filtros"
          onPress={onApply}
          testID="history-filter-apply"
        />
      </View>
    </View>
  );
}

function FilterActorInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  container: { backgroundColor: colors.background, flex: 1, gap: spacing.md, padding: spacing.lg },
  dates: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  field: { flex: 1, gap: spacing.xs, minWidth: 220 },
  filters: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  heading: { gap: spacing.xxs },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: fontFamilies.body,
    fontSize: 16,
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  list: { gap: spacing.sm, paddingBottom: spacing['2xl'] },
});
