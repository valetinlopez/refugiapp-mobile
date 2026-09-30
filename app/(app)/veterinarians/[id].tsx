import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { VeterinarianDetail } from '@/features/veterinarians/components/VeterinarianDetail';
import { useVeterinarian } from '@/features/veterinarians/hooks/useVeterinarian';
import { useDeactivateVeterinarian } from '@/features/veterinarians/hooks/useVeterinarianMutations';
import { isUuid } from '@/core/validation';
import { toVeterinarianErrorMessage } from '@/features/veterinarians/utils/veterinarianPresentation';
import { colors, spacing } from '@/theme';

export default function VeterinarianDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canManageVets } = useCapabilities();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const veterinarianId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = '/veterinarians';
  const veterinarianQuery = useVeterinarian(veterinarianId);
  const deactivateVeterinarian = useDeactivateVeterinarian();

  const handleConfirmDeactivate = useCallback(() => {
    deactivateVeterinarian.mutate(veterinarianId, { onSuccess: () => setConfirmVisible(false) });
  }, [deactivateVeterinarian, veterinarianId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver a la lista de veterinarios"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <VeterinarianDetail
          canWrite={canManageVets}
          confirmVisible={confirmVisible}
          deactivateError={
            deactivateVeterinarian.error
              ? toVeterinarianErrorMessage(deactivateVeterinarian.error)
              : null
          }
          onBack={() => navigateBack(fallbackHref)}
          onCancelDeactivate={() => setConfirmVisible(false)}
          onConfirmDeactivate={handleConfirmDeactivate}
          onEdit={() =>
            router.push({ pathname: '/veterinarians/[id]/edit', params: { id: veterinarianId } })
          }
          onRequestDeactivate={() => setConfirmVisible(true)}
          onRetry={() => void veterinarianQuery.refetch()}
          query={veterinarianQuery}
          submittingDeactivate={deactivateVeterinarian.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
