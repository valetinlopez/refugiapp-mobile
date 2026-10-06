import { router } from 'expo-router';
import { memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
} from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { AppBadge, AppButton, AppCard, AppText } from '@/components/primitives';
import { formatDateTime } from '@/components/patterns';
import { isNetworkError } from '@/core/network';
import { spacing } from '@/theme';

import { useApproveAdoption } from '../hooks/useAdoptionMutations';
import {
  useAdopter,
  useAdoptionApplications,
  useAdoptionHistory,
} from '../hooks/useAdoptionQueries';
import type { Adoption, AdoptionApplication } from '../types';
import { toApproveAdoptionErrorMessage } from '../utils/adoptionErrorMessages';
import { getApplicationStatusLabel, getApplicationStatusTone } from '../utils/adoptionPresentation';

export function AdoptionProcess({
  animalId,
  animalName,
  canManage,
  isAvailableForAdoption,
  onAdoptionApproved,
}: {
  animalId: string;
  animalName: string;
  canManage: boolean;
  isAvailableForAdoption: boolean;
  onAdoptionApproved?(): void;
}) {
  const applications = useAdoptionApplications(animalId, canManage);
  const history = useAdoptionHistory(animalId);
  const approve = useApproveAdoption(animalId);
  const [selectedApplication, setSelectedApplication] = useState<AdoptionApplication | null>(null);
  const applicationItems = useMemo(
    () => applications.data?.pages.flatMap((page) => page.items) ?? [],
    [applications.data]
  );
  const historyItems = useMemo(
    () => history.data?.pages.flatMap((page) => page.items) ?? [],
    [history.data]
  );

  const confirmApproval = () => {
    if (!selectedApplication) return;
    approve.mutate(selectedApplication.id, {
      onSuccess: () => {
        setSelectedApplication(null);
        onAdoptionApproved?.();
      },
    });
  };

  return (
    <View accessibilityLabel="Proceso de adopción" style={styles.section}>
      {canManage ? (
        <>
          <AppButton
            icon="heart"
            disabled={!isAvailableForAdoption}
            label="Nueva postulación"
            onPress={() =>
              router.push({
                pathname: '/animals/[id]/adoptions/new',
                params: { id: animalId },
              })
            }
          />
          <AppText color="textSecondary" variant="caption">
            {isAvailableForAdoption
              ? 'El animal está disponible para recibir postulaciones.'
              : 'Para registrar o aprobar postulaciones, primero el animal debe estar disponible para adopción.'}
          </AppText>
          <AppText variant="heading3">Postulaciones</AppText>
          <QueryState
            emptyMessage="Todavía no hay postulaciones para este animal."
            emptyTitle="Sin postulaciones"
            error={applications.error}
            isError={applications.isError}
            isPending={applications.isPending}
            hasItems={applicationItems.length > 0}
            loadingLabel="Cargando postulaciones"
            onRetry={() => void applications.refetch()}
          />
          {applicationItems.map((application) => (
            <ApplicationCard
              application={application}
              isApproving={approve.isPending && approve.variables === application.id}
              canApprove={isAvailableForAdoption}
              key={application.id}
              onApprove={() => {
                approve.reset();
                setSelectedApplication(application);
              }}
            />
          ))}
          {applications.hasNextPage ? (
            <AppButton
              label="Cargar más postulaciones"
              loading={applications.isFetchingNextPage}
              onPress={() => void applications.fetchNextPage()}
              variant="secondary"
            />
          ) : null}
        </>
      ) : (
        <AppText color="textSecondary">
          Tu rol puede consultar el historial, pero no los datos personales ni las postulaciones.
        </AppText>
      )}

      <AppText variant="heading3">Historial de adopciones</AppText>
      <QueryState
        emptyMessage="Este animal todavía no tiene adopciones completadas."
        emptyTitle="Sin adopciones"
        error={history.error}
        isError={history.isError}
        isPending={history.isPending}
        hasItems={historyItems.length > 0}
        loadingLabel="Cargando historial de adopciones"
        onRetry={() => void history.refetch()}
      />
      {historyItems.map((adoption) => (
        <AdoptionCard adoption={adoption} key={adoption.id} />
      ))}
      {history.hasNextPage ? (
        <AppButton
          label="Cargar más historial"
          loading={history.isFetchingNextPage}
          onPress={() => void history.fetchNextPage()}
          variant="secondary"
        />
      ) : null}

      <ConfirmDialog
        confirmLabel="Aprobar adopción"
        confirming={approve.isPending}
        consequence={`Se marcará a ${animalName} como adoptado, se aprobará esta postulación y se rechazarán las demás pendientes. Esta acción es final.`}
        errorMessage={approve.error ? toApproveAdoptionErrorMessage(approve.error) : null}
        onCancel={() => {
          if (!approve.isPending) {
            approve.reset();
            setSelectedApplication(null);
          }
        }}
        onConfirm={confirmApproval}
        title="Confirmar adopción"
        variant="danger"
        visible={selectedApplication !== null}
      />
    </View>
  );
}

const ApplicationCard = memo(function ApplicationCard({
  application,
  canApprove,
  isApproving,
  onApprove,
}: {
  application: AdoptionApplication;
  canApprove: boolean;
  isApproving: boolean;
  onApprove(): void;
}) {
  const adopter = useAdopter(application.adopterId);
  const label = getApplicationStatusLabel(application.status);

  return (
    <AppCard accessibilityLabel={`Postulación ${label}`}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <AppText variant="heading3">
              {adopter.data
                ? `${adopter.data.firstName} ${adopter.data.lastName}`
                : 'Datos del adoptante'}
            </AppText>
            <AppText color="textSecondary" variant="caption">
              Presentada {formatDateTime(application.submittedAt)}
            </AppText>
          </View>
          <AppBadge label={label} tone={getApplicationStatusTone(application.status)} />
        </View>
        {adopter.isPending ? <LoadingState label="Cargando datos del adoptante" /> : null}
        {adopter.isError ? (
          <AppText color="danger" role="alert">
            No pudimos cargar los datos de contacto.
          </AppText>
        ) : null}
        {adopter.data ? (
          <View style={styles.contact}>
            <AppText>{adopter.data.email}</AppText>
            <AppText>{adopter.data.phone}</AppText>
            {adopter.data.address ? <AppText>{adopter.data.address}</AppText> : null}
          </View>
        ) : null}
        {application.status === 'pending' ? (
          <AppButton
            label="Aprobar postulación"
            disabled={!canApprove}
            loading={isApproving}
            onPress={onApprove}
            variant="secondary"
          />
        ) : null}
      </View>
    </AppCard>
  );
});

const AdoptionCard = memo(function AdoptionCard({ adoption }: { adoption: Adoption }) {
  return (
    <AppCard accessibilityLabel={`Adopción completada ${formatDateTime(adoption.adoptedAt)}`}>
      <View style={styles.cardContent}>
        <AppBadge label="Adopción completada" tone="positive" />
        <AppText>Fecha: {formatDateTime(adoption.adoptedAt)}</AppText>
        <AppText color="textSecondary" variant="caption">
          Registro confirmado por el servidor
        </AppText>
      </View>
    </AppCard>
  );
});

function QueryState({
  emptyMessage,
  emptyTitle,
  error,
  hasItems,
  isError,
  isPending,
  loadingLabel,
  onRetry,
}: {
  emptyMessage: string;
  emptyTitle: string;
  error: unknown;
  hasItems: boolean;
  isError: boolean;
  isPending: boolean;
  loadingLabel: string;
  onRetry(): void;
}) {
  if (isPending) return <LoadingState label={loadingLabel} />;
  if (isError) {
    return isNetworkError(error) ? (
      <OfflineState
        actionLabel={offlineCopy.actionLabel}
        message={offlineCopy.message}
        onAction={onRetry}
        testID={OFFLINE_STATE_TEST_ID}
        title={offlineCopy.title}
      />
    ) : (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar esta información de adopción."
        onAction={onRetry}
        title="No se pudo cargar"
      />
    );
  }
  return hasItems ? null : <EmptyState message={emptyMessage} title={emptyTitle} />;
}

const styles = StyleSheet.create({
  cardContent: { gap: spacing.sm },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cardTitle: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  contact: { gap: spacing.xxs },
  section: { gap: spacing.md },
});
