import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { VeterinariansScreen } from '@/features/veterinarians/components/VeterinariansScreen';
import { colors } from '@/theme';

export default function VeterinariansRoute() {
  const { canManageVets } = useCapabilities();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow accessibilityHint="Volver al inicio" fallbackHref="/" />
      <VeterinariansScreen canWrite={canManageVets} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
