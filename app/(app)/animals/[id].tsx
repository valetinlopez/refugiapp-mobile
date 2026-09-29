import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBadge, AppAvatar, AppButton, AppCard, AppText } from '@/components/primitives';
import { formatDateMedium } from '@/components/patterns';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AnimalHistory } from '@/features/animals/components/AnimalHistory';
import {
  AnimalDetailTabs,
  type AnimalDetailTab,
} from '@/features/animals/components/AnimalDetailTabs';
import { AnimalStatusChanger } from '@/features/animals/components/AnimalStatusChanger';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';
import { useChangeAnimalStatus } from '@/features/animals/hooks/useChangeAnimalStatus';
import { toChangeStatusErrorMessage } from '@/features/animals/utils/animalErrorMessages';
import { getStatusBadge } from '@/features/animals/utils/animalTransitions';
import { isUuid } from '@/features/animals/utils/uuid';
import { AnimalCareTasks } from '@/features/care-tasks/components/AnimalCareTasks';
import { AnimalExpenses } from '@/features/expenses/components/AnimalExpenses';
import { ClinicalHistory } from '@/features/medical-records/components/ClinicalHistory';
import type { AnimalSex, AnimalStatus } from '@/features/animals/types';
import { colors, spacing } from '@/theme';

export default function AnimalDetailScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const capabilities = useCapabilities();

  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = '/explore';
  const animalQuery = useAnimal(animalId);
  const photoQuery = useAnimalPhoto(animalQuery.data?.profilePhotoMediaId ?? null);
  const changeStatus = useChangeAnimalStatus(animalId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver a la lista de animales"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <AnimalDetailContent
          canWrite={capabilities.canEditAnimal}
          canReadClinicalRecords={capabilities.canReadClinicalRecords}
          changeStatusError={
            changeStatus.error ? toChangeStatusErrorMessage(changeStatus.error) : null
          }
          isSubmittingStatus={changeStatus.isPending}
          onBack={() => navigateBack(fallbackHref)}
          onChangeStatus={(status) => changeStatus.mutate({ status })}
          onRetry={() => void animalQuery.refetch()}
          photoUri={photoQuery.data ?? null}
          query={animalQuery}
          {...(tab === undefined ? {} : { requestedTab: tab })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface AnimalDetailContentProps {
  canWrite: boolean;
  canReadClinicalRecords: boolean;
  changeStatusError: string | null;
  isSubmittingStatus: boolean;
  onBack(): void;
  onChangeStatus(status: AnimalStatus): void;
  onRetry(): void;
  photoUri: string | null;
  query: ReturnType<typeof useAnimal>;
  requestedTab?: string;
}

function AnimalDetailContent({
  canWrite,
  canReadClinicalRecords,
  changeStatusError,
  isSubmittingStatus,
  onBack,
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
    return <LoadingState label="Cargando animal" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar la ficha del animal. Revisá tu conexión e intentá de nuevo."
        onAction={onRetry}
        title="No se pudo cargar el animal"
      />
    );
  }

  if (query.data === undefined) {
    return (
      <EmptyState
        actionLabel="Volver"
        message="El animal que buscás ya no está disponible."
        onAction={onBack}
        title="Animal no encontrado"
      />
    );
  }

  const animal = query.data;
  const badge = getStatusBadge(animal.status);

  return (
    <View style={styles.detail}>
      <View style={styles.header}>
        <AppAvatar
          accessibilityLabel={`Foto de ${animal.name}`}
          initials={animal.name.slice(0, 2)}
          size="lg"
          source={photoUri ? { uri: photoUri } : undefined}
        />
        <View style={styles.heading}>
          <AppText variant="heading1">{animal.name}</AppText>
          <AppText color="textSecondary">
            {animal.species}
            {animal.breed ? ` · ${animal.breed}` : ''}
          </AppText>
          <AppBadge icon={badge.icon} label={badge.label} tone={badge.tone} />
        </View>
      </View>

      <AnimalDetailTabs
        activeTab={activeTab}
        canReadClinicalRecords={canReadClinicalRecords}
        onChange={setActiveTab}
      />

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

      {activeTab === 'history' ? (
        <View style={styles.historySection}>
          <AppText variant="heading2">Historial</AppText>
          <AnimalHistory animalId={animal.id} />
        </View>
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
  );
}

function isAnimalDetailTab(value: string | undefined): value is AnimalDetailTab {
  return ['summary', 'history', 'tasks', 'expenses', 'clinical'].includes(value ?? '');
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  historySection: {
    gap: spacing.sm,
  },
  heading: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
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
