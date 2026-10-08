import { useLocalSearchParams, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground } from '@/components/patterns';
import { AnimalFilesScreen } from '@/features/animals/components/AnimalFilesScreen';
import { isUuid } from '@/features/animals/utils/uuid';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

export default function AnimalFilesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canEditAnimal } = useCapabilities();
  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = animalId
    ? { pathname: '/animals/[id]', params: { id: animalId } }
    : '/explore';

  if (animalId === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver al detalle del animal"
          fallbackHref={fallbackHref}
        />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message="No pudimos identificar el animal."
            onAction={() => navigateBack(fallbackHref)}
            title="Animal inválido"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground variant="texture" />
      <AccountHeaderRow
        accessibilityHint="Volver al detalle del animal"
        fallbackHref={fallbackHref}
      />
      <AnimalFilesScreen animalId={animalId} canWrite={canEditAnimal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
