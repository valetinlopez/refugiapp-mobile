import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { navigateBack } from '@/components/navigation';
import { DecorativeBackground } from '@/components/patterns';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { VeterinarianDetail } from '@/features/veterinarians/components/VeterinarianDetail';
import { useVeterinarian } from '@/features/veterinarians/hooks/useVeterinarian';
import {
  useDeactivateVeterinarian,
  useReactivateVeterinarian,
} from '@/features/veterinarians/hooks/useVeterinarianMutations';
import { isUuid } from '@/core/validation';
import { toVeterinarianErrorMessage } from '@/features/veterinarians/utils/veterinarianPresentation';
import { colors, sizes, spacing } from '@/theme';

export default function VeterinarianDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canManageVets } = useCapabilities();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmReactivateVisible, setConfirmReactivateVisible] = useState(false);

  const veterinarianId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = '/veterinarians';
  const veterinarianQuery = useVeterinarian(veterinarianId);
  const deactivateVeterinarian = useDeactivateVeterinarian();
  const reactivateVeterinarian = useReactivateVeterinarian();

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
          canWrite={canManageVets}
          confirmReactivateVisible={canManageVets && confirmReactivateVisible}
          confirmVisible={canManageVets && confirmVisible}
          deactivateError={
            deactivateVeterinarian.error
              ? toVeterinarianErrorMessage(deactivateVeterinarian.error)
              : null
          }
          onBack={() => navigateBack(fallbackHref)}
          onCancelDeactivate={() => setConfirmVisible(false)}
          onCancelReactivate={() => setConfirmReactivateVisible(false)}
          onConfirmDeactivate={handleConfirmDeactivate}
          onConfirmReactivate={handleConfirmReactivate}
          onEdit={() =>
            router.push({ pathname: '/veterinarians/[id]/edit', params: { id: veterinarianId } })
          }
          onRequestDeactivate={() => setConfirmVisible(true)}
          onRequestReactivate={() => setConfirmReactivateVisible(true)}
          onRetry={() => void veterinarianQuery.refetch()}
          query={veterinarianQuery}
          reactivateError={
            reactivateVeterinarian.error
              ? toVeterinarianErrorMessage(reactivateVeterinarian.error)
              : null
          }
          submittingDeactivate={deactivateVeterinarian.isPending}
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
