import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { CreateVeterinarianScreen } from '@/features/veterinarians/components/CreateVeterinarianScreen';
import { colors, spacing } from '@/theme';

export default function NewVeterinarianRoute() {
  const { canManageVets } = useCapabilities();
  const veterinariansHref = '/veterinarians' as const;

  if (!canManageVets) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver a veterinarios"
          fallbackHref={veterinariansHref}
        />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="Solo los encargados y administradores pueden crear veterinarios."
            onAction={() => navigateBack(veterinariansHref)}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver a veterinarios"
        fallbackHref={veterinariansHref}
      />
      <CreateVeterinarianScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
