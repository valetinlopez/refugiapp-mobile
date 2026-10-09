import { router } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { useAnimalOptionPhoto, useAnimalOptionsWithFallback } from '@/application/animals';
import type { AnimalOption } from '@/application/animals';
import { resolveVeterinarianLabel, useVeterinarianDirectory } from '@/application/veterinarians';
import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { DecorativeBackground, ScreenHeader, formatDateShort } from '@/components/patterns';
import { AppButton, AppCard, AppText, FAB } from '@/components/primitives';
import { isNetworkError, useConnectivityStatus } from '@/core/network';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, sizes, spacing } from '@/theme';

import {
  flattenMedicalRecordPages,
  useInfiniteMedicalRecords,
} from '../hooks/useInfiniteMedicalRecords';
import type { MedicalRecord, MedicalRecordType } from '../types';
import {
  filterRecordsByAnimal,
  hasActiveGlobalClinicalFilters,
  toClinicalDateFilterIso,
  type ClinicalDateRange,
} from '../utils/globalClinicalFilters';
import { toGlobalMedicalRecordsErrorMessage } from '../utils/medicalRecordErrorMessages';
import { getRecordTypeLabel } from '../utils/medicalRecordPresentation';
import { MedicalRecordOverviewCard } from './MedicalRecordOverviewCard';
import {
  ClinicalAnimalFilterSheet,
  ClinicalDateFilterSheet,
  ClinicalTypeFilterSheet,
} from './MedicalRecordFilterSheets';

export interface MedicalRecordsOverviewScreenProps {
  initialAnimalId?: string | undefined;
  initialAnimalName?: string | undefined;
}

export function MedicalRecordsOverviewScreen({
  initialAnimalId,
  initialAnimalName,
}: MedicalRecordsOverviewScreenProps) {
  const { canReadClinicalRecords } = useCapabilities();
  const isOnline = useConnectivityStatus();
  const [animalId, setAnimalId] = useState<string | undefined>(initialAnimalId);
  const [recordType, setRecordType] = useState<MedicalRecordType | undefined>(undefined);
  const [dateRange, setDateRange] = useState<ClinicalDateRange>({});
  const [dateDraft, setDateDraft] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [animalSheetVisible, setAnimalSheetVisible] = useState(false);
  const [typeSheetVisible, setTypeSheetVisible] = useState(false);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);

  const animalsQuery = useAnimalOptionsWithFallback(animalId);
  const veterinarianDirectory = useVeterinarianDirectory();

  const serverFilters = useMemo(() => {
    const iso = toClinicalDateFilterIso(dateRange);
    return {
      ...(recordType === undefined ? {} : { recordType }),
      ...(iso.from !== undefined ? { from: iso.from } : {}),
      ...(iso.to !== undefined ? { to: iso.to } : {}),
    };
  }, [dateRange, recordType]);

  const recordsQuery = useInfiniteMedicalRecords(serverFilters);
  const records = useMemo(
    () => flattenMedicalRecordPages(recordsQuery.data?.pages),
    [recordsQuery.data?.pages]
  );
  const filteredRecords = useMemo(
    () => filterRecordsByAnimal(records, animalId),
    [animalId, records]
  );
  const totalRegistered = recordsQuery.data?.pages[0]?.total;
  const animalById = useMemo(
    () => new Map((animalsQuery.data ?? []).map((animal) => [animal.id, animal])),
    [animalsQuery.data]
  );
  const veterinarianNames = veterinarianDirectory.namesById;
  const selectedAnimalName =
    animalId === undefined
      ? undefined
      : (animalById.get(animalId)?.name ??
        (animalId === initialAnimalId ? initialAnimalName : undefined));
  const hasAnimalFilter = animalId !== undefined;
  const hasFilters = hasActiveGlobalClinicalFilters(recordType, dateRange) || hasAnimalFilter;
  const dateLabel = formatDateRangeLabel(dateRange);

  const openAnimalClinicalTab = useCallback((recordAnimalId: string) => {
    router.push({ pathname: '/animals/[id]', params: { id: recordAnimalId } });
  }, []);

  const renderRecord = useCallback(
    ({ item }: { item: MedicalRecord }) => {
      const animal = animalById.get(item.animalId);
      return (
        <ClinicalRecordRow
          animal={animal}
          onPress={() => openAnimalClinicalTab(item.animalId)}
          record={item}
          veterinarianName={resolveVeterinarianLabel(veterinarianNames, item.veterinarianId)}
        />
      );
    },
    [animalById, openAnimalClinicalTab, veterinarianNames]
  );

  const loadMore = useCallback(() => {
    if (recordsQuery.hasNextPage && !recordsQuery.isFetchingNextPage) {
      void recordsQuery.fetchNextPage();
    }
  }, [recordsQuery]);
  const refresh = useCallback(() => {
    void Promise.all([
      recordsQuery.refetch(),
      animalsQuery.refetch(),
      veterinarianDirectory.refetch(),
    ]);
  }, [animalsQuery, recordsQuery, veterinarianDirectory]);
  const selectAnimal = useCallback((nextAnimalId: string | undefined) => {
    setAnimalId(nextAnimalId);
    setAnimalSheetVisible(false);
  }, []);
  const selectType = useCallback((nextType: MedicalRecordType | undefined) => {
    setRecordType(nextType);
    setTypeSheetVisible(false);
  }, []);
  const applyDateRange = useCallback((range: ClinicalDateRange) => {
    setDateRange(range);
    setDateSheetVisible(false);
  }, []);
  const openDateSheet = useCallback(() => {
    setDateDraft({ from: dateRange.from ?? '', to: dateRange.to ?? '' });
    setDateSheetVisible(true);
  }, [dateRange]);
  const clearFilters = useCallback(() => {
    setAnimalId(undefined);
    setRecordType(undefined);
    setDateRange({});
  }, []);

  const listState = recordsQuery.isPending ? (
    <LoadingState label="Cargando historia clínica" />
  ) : recordsQuery.isError ? (
    isNetworkError(recordsQuery.error) ? (
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
        message={toGlobalMedicalRecordsErrorMessage(recordsQuery.error)}
        onAction={refresh}
        title="No se pudo cargar la historia clínica"
      />
    )
  ) : filteredRecords.length === 0 ? (
    hasAnimalFilter && records.length > 0 ? (
      <EmptyState
        actionLabel="Cargar más registros"
        message="No hay coincidencias para el animal elegido en los registros cargados."
        onAction={loadMore}
        title="Sin coincidencias cargadas"
      />
    ) : (
      <EmptyState
        message={
          hasFilters
            ? 'No hay registros clínicos con los filtros seleccionados.'
            : 'Todavía no hay registros clínicos.'
        }
        title="Sin historia clínica"
      />
    )
  ) : null;

  return (
    <View style={styles.container}>
      <DecorativeBackground variant="texture" />
      <FlatList
        {...virtualizedListPerformanceProps}
        contentContainerStyle={styles.list}
        data={filteredRecords}
        keyExtractor={(record) => record.id}
        ListEmptyComponent={listState}
        ListFooterComponent={
          filteredRecords.length === 0 ? null : recordsQuery.isFetchingNextPage ? (
            <LoadingState label="Cargando más registros" />
          ) : recordsQuery.isFetchNextPageError ? (
            <View style={styles.paginationState}>
              <AppText color="danger">No pudimos cargar más registros.</AppText>
              <AppButton label="Reintentar carga" onPress={loadMore} variant="secondary" />
            </View>
          ) : recordsQuery.hasNextPage ? (
            <AppButton
              label="Cargar más registros"
              onPress={loadMore}
              testID="clinical-load-more"
              variant="secondary"
            />
          ) : (
            <AppText color="textSecondary" style={styles.endOfList} testID="clinical-end-of-list">
              No hay más registros
            </AppText>
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader subtitle="Registros clínicos del refugio" title="Historia clínica" />
            <AppCard
              accessibilityLabel="Resumen de historia clínica"
              accessibilityRole="summary"
              style={styles.summary}
              variant="outlined"
            >
              <AppText color="textSecondary" variant="label">
                Registros según tipo y fechas
              </AppText>
              <AppText variant="heading1">
                {totalRegistered === undefined ? '—' : totalRegistered}
              </AppText>
              {hasAnimalFilter ? (
                <AppText accessibilityLiveRegion="polite" color="textSecondary" variant="caption">
                  El filtro de animal se aplica sobre los registros cargados (
                  {filteredRecords.length}). Cargá más registros para ver más coincidencias.
                </AppText>
              ) : (
                <AppText accessibilityLiveRegion="polite" color="textSecondary" variant="caption">
                  {totalRegistered === undefined
                    ? 'Calculando registros…'
                    : `${totalRegistered} ${totalRegistered === 1 ? 'registro' : 'registros'} según los filtros`}
                </AppText>
              )}
            </AppCard>
            <View style={styles.filters}>
              <AppButton
                disabled={animalsQuery.isPending}
                icon="paw"
                label={selectedAnimalName ?? 'Todos los animales'}
                onPress={() => setAnimalSheetVisible(true)}
                testID="clinical-animal-filter"
                variant="secondary"
              />
              <AppButton
                icon="medical"
                label={
                  recordType === undefined ? 'Todos los tipos' : getRecordTypeLabel(recordType)
                }
                onPress={() => setTypeSheetVisible(true)}
                testID="clinical-type-filter"
                variant="secondary"
              />
              <AppButton
                icon="calendar"
                label={dateLabel}
                onPress={openDateSheet}
                testID="clinical-date-filter"
                variant="secondary"
              />
              {hasFilters ? (
                <AppButton
                  label="Limpiar"
                  onPress={clearFilters}
                  testID="clinical-clear-filters"
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
            {!isOnline ? (
              <AppText color="textSecondary" variant="caption">
                Estás trabajando con los registros ya cargados y sin conexión.
              </AppText>
            ) : null}
            {!hasAnimalFilter && canReadClinicalRecords ? (
              <AppText color="textSecondary" variant="caption">
                Para registrar un nuevo registro clínico, elegí un animal.
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
            refreshing={recordsQuery.isRefetching && !recordsQuery.isFetchingNextPage}
            tintColor={colors.positive}
          />
        }
        renderItem={renderRecord}
        testID="clinical-global-list"
      />
      {hasAnimalFilter && canReadClinicalRecords ? (
        <FAB
          accessibilityHint="Abre el formulario de registro clínico del animal en su ficha"
          accessibilityLabel={`Registrar consulta para ${selectedAnimalName ?? 'el animal'}`}
          bottomOffset={spacing.lg}
          onPress={() =>
            router.push({
              pathname: '/animals/[id]/medical-records/new',
              params: { id: animalId ?? '' },
            })
          }
          testID="clinical-global-create"
        />
      ) : null}
      <ClinicalAnimalFilterSheet
        animals={animalsQuery.data ?? []}
        onClose={() => setAnimalSheetVisible(false)}
        onSelect={selectAnimal}
        selectedAnimalId={animalId}
        visible={animalSheetVisible}
      />
      <ClinicalTypeFilterSheet
        onClose={() => setTypeSheetVisible(false)}
        onSelect={selectType}
        selectedType={recordType}
        visible={typeSheetVisible}
      />
      <ClinicalDateFilterSheet
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

interface ClinicalRecordRowProps {
  animal: AnimalOption | undefined;
  onPress: () => void;
  record: MedicalRecord;
  veterinarianName: string;
}

/**
 * Memoized row that resolves the animal photo through the shared media cache.
 * The photo query is keyed by `mediaId`, so repeated media ids across rows are
 * de-duplicated and rows without a photo never fetch.
 */
const ClinicalRecordRow = memo(function ClinicalRecordRow({
  animal,
  onPress,
  record,
  veterinarianName,
}: ClinicalRecordRowProps) {
  const photoQuery = useAnimalOptionPhoto(animal?.profilePhotoMediaId ?? null);
  return (
    <MedicalRecordOverviewCard
      animalName={animal?.name ?? 'Animal no disponible'}
      animalPhotoUri={photoQuery.isSuccess ? photoQuery.data : undefined}
      onPress={onPress}
      record={record}
      veterinarianName={veterinarianName}
    />
  );
});

function formatDateRangeLabel(range: ClinicalDateRange): string {
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
