import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { DecorativeBackground, ScreenHeader, formatDateShort } from '@/components/patterns';
import { AppButton, AppCard, AppText, FAB } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, sizes, spacing } from '@/theme';

import { useExpenseAnimals } from '../hooks/useExpenseAnimals';
import { flattenExpensePages, useInfiniteExpenses } from '../hooks/useInfiniteExpenses';
import type { Expense, ExpenseCategory, ExpenseFilters } from '../types';
import {
  hasActiveExpenseFilters,
  toExpenseDateFilterIso,
  type ExpenseDateRange,
} from '../utils/expenseFilters';
import { formatAmountCents, getExpenseCategoryLabel } from '../utils/expensePresentation';
import { sumExpenseAmountCents } from '../utils/expenseTotals';
import {
  ExpenseAnimalFilterSheet,
  ExpenseCategoryFilterSheet,
  ExpenseDateFilterSheet,
} from './ExpenseFilterSheets';
import { ExpenseOverviewCard } from './ExpenseOverviewCard';

export interface ExpensesOverviewScreenProps {
  initialAnimalId?: string | undefined;
  initialAnimalName?: string | undefined;
}

export function ExpensesOverviewScreen({
  initialAnimalId,
  initialAnimalName,
}: ExpensesOverviewScreenProps) {
  const { canManageExpenses: canWrite } = useCapabilities();
  const [animalId, setAnimalId] = useState<string | undefined>(initialAnimalId);
  const [category, setCategory] = useState<ExpenseCategory | undefined>(undefined);
  const [dateRange, setDateRange] = useState<ExpenseDateRange>({});
  const [dateDraft, setDateDraft] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });
  const [animalSheetVisible, setAnimalSheetVisible] = useState(false);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);

  const animalsQuery = useExpenseAnimals(animalId);
  const filters = useMemo<ExpenseFilters>(() => {
    const iso = toExpenseDateFilterIso(dateRange);
    return {
      ...(animalId !== undefined ? { animalId } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(iso.from !== undefined ? { from: iso.from } : {}),
      ...(iso.to !== undefined ? { to: iso.to } : {}),
    };
  }, [animalId, category, dateRange]);

  const expensesQuery = useInfiniteExpenses(filters);
  const expenses = useMemo(
    () => flattenExpensePages(expensesQuery.data?.pages),
    [expensesQuery.data?.pages]
  );
  const loadedSubtotal = useMemo(() => sumExpenseAmountCents(expenses), [expenses]);
  const totalRegistered = expensesQuery.data?.pages[0]?.total;
  const animalNames = useMemo(
    () => new Map(animalsQuery.data?.map((animal) => [animal.id, animal.name]) ?? []),
    [animalsQuery.data]
  );
  const selectedAnimalName =
    animalId === undefined
      ? undefined
      : (animalNames.get(animalId) ??
        (animalId === initialAnimalId ? initialAnimalName : undefined));
  const hasFilters = hasActiveExpenseFilters(filters);
  const dateLabel = formatDateRangeLabel(dateRange);

  const renderExpense = useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseOverviewCard
        animalName={animalNames.get(item.animalId) ?? 'Animal no disponible'}
        expense={item}
        onPress={(id) => router.push({ pathname: '/expenses/[id]', params: { id } })}
      />
    ),
    [animalNames]
  );
  const loadMore = useCallback(() => {
    if (expensesQuery.hasNextPage && !expensesQuery.isFetchingNextPage) {
      void expensesQuery.fetchNextPage();
    }
  }, [expensesQuery]);
  const refresh = useCallback(() => {
    void Promise.all([expensesQuery.refetch(), animalsQuery.refetch()]);
  }, [animalsQuery, expensesQuery]);
  const selectAnimal = useCallback((nextAnimalId: string | undefined) => {
    setAnimalId(nextAnimalId);
    setAnimalSheetVisible(false);
  }, []);
  const selectCategory = useCallback((nextCategory: ExpenseCategory | undefined) => {
    setCategory(nextCategory);
    setCategorySheetVisible(false);
  }, []);
  const applyDateRange = useCallback((range: ExpenseDateRange) => {
    setDateRange(range);
    setDateSheetVisible(false);
  }, []);
  const openDateSheet = useCallback(() => {
    setDateDraft({ from: dateRange.from ?? '', to: dateRange.to ?? '' });
    setDateSheetVisible(true);
  }, [dateRange]);
  const clearFilters = useCallback(() => {
    setAnimalId(undefined);
    setCategory(undefined);
    setDateRange({});
  }, []);

  const listState = expensesQuery.isPending ? (
    <LoadingState label="Cargando gastos" />
  ) : expensesQuery.isError ? (
    isNetworkError(expensesQuery.error) ? (
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
        message="No pudimos cargar los gastos del refugio."
        onAction={refresh}
        title="No se pudieron cargar los gastos"
      />
    )
  ) : (
    <EmptyState
      message={
        hasFilters
          ? 'No hay gastos registrados con los filtros seleccionados.'
          : 'Todavía no hay gastos registrados.'
      }
      title="Sin gastos"
    />
  );

  return (
    <View style={styles.container}>
      <DecorativeBackground variant="texture" />
      <FlatList
        {...virtualizedListPerformanceProps}
        contentContainerStyle={styles.list}
        data={expenses}
        keyExtractor={(expense) => expense.id}
        ListEmptyComponent={listState}
        ListFooterComponent={
          expenses.length === 0 ? null : expensesQuery.isFetchingNextPage ? (
            <LoadingState label="Cargando más gastos" />
          ) : expensesQuery.isFetchNextPageError ? (
            <View style={styles.paginationState}>
              <AppText color="danger">No pudimos cargar más gastos.</AppText>
              <AppButton label="Reintentar carga" onPress={loadMore} variant="secondary" />
            </View>
          ) : expensesQuery.hasNextPage ? (
            <AppButton
              label="Cargar más gastos"
              onPress={loadMore}
              testID="expenses-load-more"
              variant="secondary"
            />
          ) : (
            <AppText color="textSecondary" style={styles.endOfList} testID="expenses-end-of-list">
              No hay más gastos
            </AppText>
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader subtitle="Registro de gastos del refugio" title="Gastos" />
            <AppCard
              accessibilityLabel="Resumen de gastos"
              accessibilityRole="summary"
              style={styles.summary}
              variant="outlined"
            >
              <AppText color="textSecondary" variant="label">
                Subtotal cargado
              </AppText>
              <AppText variant="heading1">{formatAmountCents(loadedSubtotal)}</AppText>
              <AppText accessibilityLiveRegion="polite" color="textSecondary" variant="caption">
                {totalRegistered === undefined
                  ? 'Calculando registros…'
                  : `${totalRegistered} ${totalRegistered === 1 ? 'gasto' : 'gastos'} según los filtros`}
              </AppText>
              {totalRegistered !== undefined && totalRegistered > expenses.length ? (
                <AppText color="textSecondary" variant="caption">
                  Subtotal de {expenses.length} de {totalRegistered} gastos cargados.
                </AppText>
              ) : null}
            </AppCard>
            <View style={styles.filters}>
              <AppButton
                disabled={animalsQuery.isPending}
                icon="paw"
                label={selectedAnimalName ?? 'Todos los animales'}
                onPress={() => setAnimalSheetVisible(true)}
                testID="expense-animal-filter"
                variant="secondary"
              />
              <AppButton
                icon="filter"
                label={category ? getExpenseCategoryLabel(category) : 'Todas las categorías'}
                onPress={() => setCategorySheetVisible(true)}
                testID="expense-category-filter"
                variant="secondary"
              />
              <AppButton
                icon="calendar"
                label={dateLabel}
                onPress={openDateSheet}
                testID="expense-date-filter"
                variant="secondary"
              />
              {hasFilters ? (
                <AppButton
                  label="Limpiar"
                  onPress={clearFilters}
                  testID="expense-clear-filters"
                  variant="ghost"
                />
              ) : null}
            </View>
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
                Tu rol permite consultar gastos. El registro está restringido.
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
            refreshing={expensesQuery.isRefetching && !expensesQuery.isFetchingNextPage}
            tintColor={colors.positive}
          />
        }
        renderItem={renderExpense}
        testID="expenses-list"
      />
      {canWrite ? (
        <FAB
          accessibilityHint="Abre el formulario para registrar un gasto"
          accessibilityLabel="Registrar gasto"
          bottomOffset={spacing.lg}
          onPress={() =>
            router.push({ pathname: '/expenses/new', params: animalId ? { animalId } : {} })
          }
          testID="expense-create"
        />
      ) : null}
      <ExpenseAnimalFilterSheet
        animals={animalsQuery.data ?? []}
        onClose={() => setAnimalSheetVisible(false)}
        onSelect={selectAnimal}
        selectedAnimalId={animalId}
        visible={animalSheetVisible}
      />
      <ExpenseCategoryFilterSheet
        onClose={() => setCategorySheetVisible(false)}
        onSelect={selectCategory}
        selectedCategory={category}
        visible={categorySheetVisible}
      />
      <ExpenseDateFilterSheet
        from={dateDraft.from}
        onChangeFrom={(value) => setDateDraft((draft) => ({ ...draft, from: value }))}
        onChangeTo={(value) => setDateDraft((draft) => ({ ...draft, to: value }))}
        onApply={applyDateRange}
        onClose={() => setDateSheetVisible(false)}
        to={dateDraft.to}
        visible={dateSheetVisible}
      />
    </View>
  );
}

function formatDateRangeLabel(range: ExpenseDateRange): string {
  if (range.from !== undefined && range.to !== undefined) {
    return `${formatDateShort(range.from)} – ${formatDateShort(range.to)}`;
  }
  if (range.from !== undefined) return `Desde ${formatDateShort(range.from)}`;
  if (range.to !== undefined) return `Hasta ${formatDateShort(range.to)}`;
  return 'Todas las fechas';
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  header: { gap: spacing.md, marginBottom: spacing.md },
  inlineError: { alignItems: 'flex-start', gap: spacing.xxs },
  list: {
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: sizes.fab + spacing['2xl'] + spacing.lg,
  },
  paginationState: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  summary: { gap: spacing.xxs },
});
