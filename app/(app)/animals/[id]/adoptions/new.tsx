import { useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AppText } from '@/components/primitives';
import { isUuid } from '@/core/validation';
import { AdopterForm } from '@/features/adoptions/components/AdopterForm';
import { useCreateAdoptionApplication } from '@/features/adoptions/hooks/useAdoptionMutations';
import {
  CreateApplicationError,
  toCreateApplicationErrorMessage,
} from '@/features/adoptions/utils/adoptionErrorMessages';
import { toCreateAdopterRequest } from '@/features/adoptions/utils/toCreateAdopterRequest';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

export default function CreateAdoptionApplicationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = animalId
    ? { pathname: '/animals/[id]', params: { id: animalId, tab: 'adoptions' } }
    : '/explore';
  const { canManageAdoptions } = useCapabilities();
  const createApplication = useCreateAdoptionApplication(animalId);

  if (!canManageAdoptions || animalId === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow accessibilityHint="Volver al animal" fallbackHref={fallbackHref} />
        <View style={styles.centered}>
          <EmptyState
            actionLabel="Volver"
            message={
              animalId === ''
                ? 'El identificador del animal no es válido.'
                : 'Tu rol puede consultar el historial, pero no registrar postulaciones.'
            }
            onAction={() => navigateBack(fallbackHref)}
            title={animalId === '' ? 'Animal inválido' : 'Sin permiso'}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver al proceso de adopción"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Nueva postulación</AppText>
        <AppText color="textSecondary">
          Registrá los datos de contacto. Al guardar se creará la postulación para este animal.
        </AppText>
        <AdopterForm
          errorMessage={
            createApplication.error
              ? toCreateApplicationErrorMessage(createApplication.error)
              : null
          }
          isSubmitting={createApplication.isPending}
          onSubmit={(adopter) => {
            const existingAdopterId =
              createApplication.error instanceof CreateApplicationError
                ? createApplication.error.adopterId
                : undefined;
            createApplication.mutate(
              existingAdopterId
                ? { existingAdopterId }
                : { adopter: toCreateAdopterRequest(adopter) },
              { onSuccess: () => navigateBack(fallbackHref) }
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  content: { flexGrow: 1, gap: spacing.md, padding: spacing.lg },
  safeArea: { backgroundColor: colors.background, flex: 1 },
});
