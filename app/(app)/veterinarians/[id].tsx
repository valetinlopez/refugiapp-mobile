import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { navigateBack } from '@/components/navigation';
import { DecorativeBackground } from '@/components/patterns';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { VeterinarianDetail } from '@/features/veterinarians/components/VeterinarianDetail';
import type { VeterinarianDeleteStep } from '@/features/veterinarians/components/VeterinarianDeleteDialog';
import { useVeterinarian } from '@/features/veterinarians/hooks/useVeterinarian';
import {
  useDeactivateVeterinarian,
  useDeleteVeterinarian,
  useReactivateVeterinarian,
} from '@/features/veterinarians/hooks/useVeterinarianMutations';
import { isUuid } from '@/core/validation';
import {
  toDeleteVeterinarianErrorMessage,
  toVeterinarianErrorMessage,
} from '@/features/veterinarians/utils/veterinarianPresentation';
import { colors, sizes, spacing } from '@/theme';

export default function VeterinarianDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canDeleteProtected, canManageVets } = useCapabilities();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmReactivateVisible, setConfirmReactivateVisible] = useState(false);
  const [deleteStep, setDeleteStep] = useState<VeterinarianDeleteStep | null>(null);

  const veterinarianId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = '/veterinarians';
  const veterinarianQuery = useVeterinarian(veterinarianId);
  const deactivateVeterinarian = useDeactivateVeterinarian();
  const reactivateVeterinarian = useReactivateVeterinarian();
  const deleteVeterinarian = useDeleteVeterinarian();

  const handleConfirmDeactivate = useCallback(() => {
    if (!canManageVets) {
      setConfirmVisible(false);
      return;
    }
    deactivateVeterinarian.mutate(veterinarianId, { onSuccess: () => setConfirmVisible(false) });
  }, [canManageVets, deactivateVeterinarian, veterinarianId]);

  const handleConfirmReactivate = useCallback(() => {
    if (!canManageVets) {
      setConfirmReactivateVisible(false);
      return;
    }
    reactivateVeterinarian.mutate(veterinarianId, {
      onSuccess: () => setConfirmReactivateVisible(false),
    });
  }, [canManageVets, reactivateVeterinarian, veterinarianId]);

  const closeDeleteDialog = useCallback(() => {
    if (deleteVeterinarian.isPending) return;
    deleteVeterinarian.reset();
    setDeleteStep(null);
  }, [deleteVeterinarian]);

  const handleConfirmDelete = useCallback(() => {
    if (!canDeleteProtected) {
      setDeleteStep(null);
      return;
    }
    deleteVeterinarian.mutate(veterinarianId, {
      onSuccess: () => {
        setDeleteStep(null);
        AccessibilityInfo.announceForAccessibility('Veterinario eliminado.');
        navigateBack(fallbackHref);
      },
    });
  }, [canDeleteProtected, deleteVeterinarian, fallbackHref, veterinarianId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground overlay variant="texture" />
      <AccountHeaderRow
        accessibilityHint="Volver a la lista de veterinarios"
        fallbackHref={fallbackHref}
        label="Veterinarios"
      />
      <ScrollView contentContainerStyle={styles.content} testID="veterinarian-detail-screen">
        <VeterinarianDetail
          canDelete={canDeleteProtected}
          canWrite={canManageVets}
          confirmReactivateVisible={canManageVets && confirmReactivateVisible}
          confirmVisible={canManageVets && confirmVisible}
          deactivateError={
            deactivateVeterinarian.error
              ? toVeterinarianErrorMessage(deactivateVeterinarian.error)
              : null
          }
          deleteError={
            deleteVeterinarian.error
              ? toDeleteVeterinarianErrorMessage(deleteVeterinarian.error)
              : null
          }
          deleteStep={canDeleteProtected ? deleteStep : null}
          onAdvanceDelete={() => setDeleteStep('acknowledge')}
          onBack={() => navigateBack(fallbackHref)}
          onCancelDeactivate={() => setConfirmVisible(false)}
          onCancelDelete={closeDeleteDialog}
          onCancelReactivate={() => setConfirmReactivateVisible(false)}
          onConfirmDeactivate={handleConfirmDeactivate}
          onConfirmDelete={handleConfirmDelete}
          onConfirmReactivate={handleConfirmReactivate}
          onEdit={() =>
            router.push({ pathname: '/veterinarians/[id]/edit', params: { id: veterinarianId } })
          }
          onRequestDeactivate={() => setConfirmVisible(true)}
          onRequestDelete={() => {
            deleteVeterinarian.reset();
            setDeleteStep('confirm');
          }}
          onRequestReactivate={() => setConfirmReactivateVisible(true)}
          onRetry={() => void veterinarianQuery.refetch()}
          query={veterinarianQuery}
          reactivateError={
            reactivateVeterinarian.error
              ? toVeterinarianErrorMessage(reactivateVeterinarian.error)
              : null
          }
          submittingDeactivate={deactivateVeterinarian.isPending}
          submittingDelete={deleteVeterinarian.isPending}
          submittingReactivate={reactivateVeterinarian.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: spacing.lg,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
