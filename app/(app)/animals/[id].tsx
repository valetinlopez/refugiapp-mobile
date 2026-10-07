import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppCard, AppText } from '@/components/primitives';
import { DecorativeBackground, formatDateMedium, ScreenHeader } from '@/components/patterns';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AnimalHistory } from '@/features/animals/components/AnimalHistory';
import { AnimalDetailHeader } from '@/features/animals/components/AnimalDetailHeader';
import {
  AnimalDetailTabs,
  type AnimalDetailTab,
} from '@/features/animals/components/AnimalDetailTabs';
import { AnimalStatusChanger } from '@/features/animals/components/AnimalStatusChanger';
import { AdoptionProcess } from '@/features/adoptions/components/AdoptionProcess';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { animalKeys } from '@/features/animals/hooks/animalKeys';
import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';
import { useChangeAnimalStatus } from '@/features/animals/hooks/useChangeAnimalStatus';
import { toChangeStatusErrorMessage } from '@/features/animals/utils/animalErrorMessages';
import { isUuid } from '@/features/animals/utils/uuid';
import { AnimalCareTasks } from '@/features/care-tasks/components/AnimalCareTasks';
import { AnimalExpenses } from '@/features/expenses/components/AnimalExpenses';
import { ClinicalHistory } from '@/features/medical-records/components/ClinicalHistory';
import type { AnimalSex, AnimalStatus } from '@/features/animals/types';
import { colors, spacing } from '@/theme';

export default function AnimalDetailScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const capabilities = useCapabilities();
  const queryClient = useQueryClient();

  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = '/explore';
  const animalQuery = useAnimal(animalId);
  const photoQuery = useAnimalPhoto(animalQuery.data?.profilePhotoMediaId ?? null);
  const changeStatus = useChangeAnimalStatus(animalId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground variant="texture" />
      <AccountHeaderRow
        accessibilityHint="Volver a la lista de animales"
        fallbackHref={fallbackHref}
      />
      <AnimalDetailContent
        canWrite={capabilities.canEditAnimal}
        canReadClinicalRecords={capabilities.canReadClinicalRecords}
        canManageAdoptions={capabilities.canManageAdoptions}
        changeStatusError={
          changeStatus.error ? toChangeStatusErrorMessage(changeStatus.error) : null
        }
        isSubmittingStatus={changeStatus.isPending}
        onBack={() => navigateBack(fallbackHref)}
        onChangeStatus={(status) => changeStatus.mutate({ status })}
        onRetry={() => void animalQuery.refetch()}
        onAdoptionApproved={() => {
          void queryClient.invalidateQueries({ queryKey: animalKeys.all });
        }}
        photoUri={photoQuery.data ?? null}
        query={animalQuery}
        {...(tab === undefined ? {} : { requestedTab: tab })}
      />
    </SafeAreaView>
  );
}

interface AnimalDetailContentProps {
  canWrite: boolean;
  canReadClinicalRecords: boolean;
  canManageAdoptions: boolean;
  changeStatusError: string | null;
  isSubmittingStatus: boolean;
  onBack(): void;
  onAdoptionApproved(): void;
  onChangeStatus(status: AnimalStatus): void;
  onRetry(): void;
  photoUri: string | null;
  query: ReturnType<typeof useAnimal>;
  requestedTab?: string;
}

function AnimalDetailContent({
  canWrite,
  canReadClinicalRecords,
  canManageAdoptions,
  changeStatusError,
  isSubmittingStatus,
  onBack,
  onAdoptionApproved,
  onChangeStatus,
  onRetry,
  photoUri,
  query,
  requestedTab,
}: AnimalDetailContentProps) {
  const [activeTab, setActiveTab] = useState<AnimalDetailTab>(
    isAnimalDetailTab(requestedTab) ? requestedTab : 'summary'
  );
  if (query.isPending) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <LoadingState label="Cargando animal" />
      </ScrollView>
    );
  }

  if (query.isError) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <ErrorState
          actionLabel="Reintentar"
          message="No pudimos cargar la ficha del animal. Revisá tu conexión e intentá de nuevo."
          onAction={onRetry}
          title="No se pudo cargar el animal"
        />
      </ScrollView>
    );
  }

  if (query.data === undefined) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <EmptyState
          actionLabel="Volver"
          message="El animal que buscás ya no está disponible."
          onAction={onBack}
          title="Animal no encontrado"
        />
      </ScrollView>
    );
  }

  const animal = query.data;
  const detailHeader = (
    <View style={styles.detailHeader}>
      <ScreenHeader title="Detalle del animal" />
      <AnimalDetailHeader animal={animal} photoUri={photoUri} />
      <AnimalDetailTabs
        activeTab={activeTab}
        canReadClinicalRecords={canReadClinicalRecords}
        onChange={setActiveTab}
      />
    </View>
  );

  if (activeTab === 'history') {
    return (
      <AnimalHistory
        animalId={animal.id}
        canCreateEvent={canWrite}
        header={detailHeader}
        onCreateEvent={() =>
          router.push({
            pathname: '/animals/[id]/events/new',
            params: { id: animal.id },
          })
        }
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.detail}>
        {detailHeader}

        {activeTab === 'summary' ? (
          <>
            <AppCard accessibilityLabel="Resumen del animal">
              <View style={styles.row}>
                <AppText color="textSecondary" style={styles.rowLabel} variant="label">
                  Sexo
                </AppText>
                <AppText style={styles.rowValue}>{sexLabel(animal.sex)}</AppText>
              </View>
              <View style={styles.row}>
                <AppText color="textSecondary" style={styles.rowLabel} variant="label">
                  Fecha de ingreso
                </AppText>
                <AppText style={styles.rowValue}>{formatDateMedium(animal.intakeDate)}</AppText>
              </View>
              <View style={styles.row}>
                <AppText color="textSecondary" style={styles.rowLabel} variant="label">
                  Fecha de nacimiento
                </AppText>
                <AppText style={styles.rowValue}>
                  {animal.birthDate ? formatDateMedium(animal.birthDate) : 'No informada'}
                </AppText>
              </View>
            </AppCard>

            {canWrite ? (
              <View style={styles.writeSection}>
                <AppButton
                  icon="refresh"
                  label="Editar ficha"
                  onPress={() =>
                    router.push({
                      pathname: '/animals/[id]/edit',
                      params: { id: animal.id },
                    })
                  }
                  variant="secondary"
                />
                <AppButton
                  label="Registrar evento general"
                  onPress={() =>
                    router.push({
                      pathname: '/animals/[id]/events/new',
                      params: { id: animal.id },
                    })
                  }
                  variant="secondary"
                />
                <AppButton
                  label="Registrar gasto"
                  onPress={() =>
                    router.push({
                      pathname: '/expenses/new',
                      params: { animalId: animal.id },
                    } as unknown as Href)
                  }
                  variant="secondary"
                />
                <AppText variant="heading2">Cambiar estado</AppText>
                <AnimalStatusChanger
                  currentStatus={animal.status}
                  errorMessage={changeStatusError}
                  onConfirm={onChangeStatus}
                  submitting={isSubmittingStatus}
                />
              </View>
            ) : null}
          </>
        ) : null}

        {activeTab === 'tasks' ? (
          <View style={styles.historySection}>
            <AppText variant="heading2">Tareas</AppText>
            <AnimalCareTasks animalId={animal.id} animalName={animal.name} canWrite={canWrite} />
          </View>
        ) : null}

        {activeTab === 'expenses' ? (
          <View style={styles.historySection}>
            <AppText variant="heading2">Gastos</AppText>
            <AnimalExpenses animalId={animal.id} canWrite={canWrite} />
          </View>
        ) : null}

        {activeTab === 'adoptions' ? (
          <View style={styles.historySection}>
            <AppText variant="heading2">Adopción</AppText>
            <AdoptionProcess
              animalId={animal.id}
              animalName={animal.name}
              canManage={canManageAdoptions}
              isAvailableForAdoption={animal.status === 'available_for_adoption'}
              onAdoptionApproved={onAdoptionApproved}
            />
          </View>
        ) : null}

        {activeTab === 'clinical' && canReadClinicalRecords ? (
          <View style={styles.historySection}>
            <View style={styles.clinicalHeader}>
              <AppText variant="heading2">Evolución clínica</AppText>
              <AppButton
                accessibilityLabel="Registrar consulta"
                icon="medical"
                label=""
                onPress={() =>
                  router.push({
                    pathname: '/animals/[id]/medical-records/new',
                    params: { id: animal.id },
                  })
                }
                variant="secondary"
              />
            </View>
            <ClinicalHistory
              animalId={animal.id}
              onEditRecord={(recordId) =>
                router.push({
                  pathname: '/animals/[id]/medical-records/[recordId]/edit',
                  params: { id: animal.id, recordId },
                })
              }
              onViewChanges={(recordId) =>
                router.push({
                  pathname: '/animals/[id]/medical-records/[recordId]/changes',
                  params: { id: animal.id, recordId },
                })
              }
            />
          </View>
        ) : null}
        {activeTab === 'clinical' && !canReadClinicalRecords ? (
          <EmptyState
            actionLabel="Ver resumen"
            message="Tu rol no permite consultar datos clínicos. El servidor también protege esta información."
            onAction={() => setActiveTab('summary')}
            title="Acceso restringido"
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

function isAnimalDetailTab(value: string | undefined): value is AnimalDetailTab {
  return ['summary', 'history', 'tasks', 'expenses', 'adoptions', 'clinical'].includes(value ?? '');
}

function sexLabel(sex: AnimalSex): string {
  switch (sex) {
    case 'female':
      return 'Hembra';
    case 'male':
      return 'Macho';
    case 'unknown':
      return 'Desconocido';
  }
}

const styles = StyleSheet.create({
  clinicalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  detail: {
    gap: spacing.lg,
  },
  detailHeader: {
    gap: spacing.lg,
  },
  historySection: {
    gap: spacing.sm,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  rowLabel: {
    flexShrink: 0,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  writeSection: {
    gap: spacing.md,
  },
});
