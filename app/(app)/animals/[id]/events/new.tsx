import { useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { navigateBack } from '@/components/navigation';
import { EmptyState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { CreateAnimalEventForm } from '@/features/animals/components/CreateAnimalEventForm';
import { useCreateAnimalEvent } from '@/features/animals/hooks/useCreateAnimalEvent';
import type { CreateAnimalHistoryEventRequest } from '@/features/animals/types';
import { toCreateAnimalEventErrorMessage } from '@/features/animals/utils/animalErrorMessages';
import { isUuid } from '@/features/animals/utils/uuid';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { colors, spacing } from '@/theme';

export default function CreateAnimalEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canEditAnimal: canWrite } = useCapabilities();
  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = animalId
    ? { pathname: '/animals/[id]', params: { id: animalId } }
    : '/explore';
  const createEvent = useCreateAnimalEvent(animalId);

  if (!canWrite || animalId === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver al detalle del animal"
          fallbackHref={fallbackHref}
        />
        <View style={styles.denied}>
          <EmptyState
            actionLabel="Volver"
            message={
              animalId === ''
                ? 'No pudimos identificar el animal.'
                : 'Tu rol permite consultar el historial, pero no registrar eventos generales.'
            }
            onAction={() => navigateBack(fallbackHref)}
            title={animalId === '' ? 'Animal inválido' : 'Sin permiso'}
          />
        </View>
      </SafeAreaView>
    );
  }

  function handleSubmit(event: CreateAnimalHistoryEventRequest): void {
    createEvent.mutate(event, { onSuccess: () => navigateBack(fallbackHref) });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver al detalle del animal"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Registrar evento</AppText>
        <AppText color="textSecondary">
          Agregá una novedad general al historial del animal. Los datos clínicos se registran por
          separado.
        </AppText>
        <CreateAnimalEventForm
          errorMessage={
            createEvent.error ? toCreateAnimalEventErrorMessage(createEvent.error) : null
          }
          isSubmitting={createEvent.isPending}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  denied: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
