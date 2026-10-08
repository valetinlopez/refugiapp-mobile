import { useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState, OfflineState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground, ScreenHeader } from '@/components/patterns';
import { isNetworkError } from '@/core/network';
import { AnimalEventIdentityCard } from '@/features/animals/components/AnimalEventIdentityCard';
import { CreateAnimalEventForm } from '@/features/animals/components/CreateAnimalEventForm';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';
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
  const animalQuery = useAnimal(animalId);
  const photoQuery = useAnimalPhoto(animalQuery.data?.profilePhotoMediaId ?? null);
  const createEvent = useCreateAnimalEvent(animalId);

  if (!canWrite || animalId === '') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver al detalle del animal"
          fallbackHref={fallbackHref}
        />
        <View style={styles.centered}>
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

  const animal = animalQuery.data;
  const offline = animalQuery.isError && isNetworkError(animalQuery.error);

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground variant="texture" />
      <AccountHeaderRow
        accessibilityHint="Volver al detalle del animal"
        fallbackHref={fallbackHref}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Agregar evento"
          {...(animal ? { subtitle: `Historial de ${animal.name}` } : {})}
        />

        {animalQuery.isPending ? <LoadingState label="Preparando formulario" /> : null}

        {offline ? (
          <OfflineState
            actionLabel="Reintentar"
            message="No pudimos preparar el formulario sin conexión. Revisá tu red e intentá de nuevo."
            onAction={() => {
              void animalQuery.refetch();
            }}
            title="Estás sin conexión"
          />
        ) : null}

        {animalQuery.isError && !offline ? (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos preparar el formulario del evento general."
            onAction={() => {
              void animalQuery.refetch();
            }}
            title="No se pudo preparar"
          />
        ) : null}

        {animal ? (
          <>
            <AnimalEventIdentityCard
              breed={animal.breed}
              name={animal.name}
              photoUri={photoQuery.data ?? null}
              species={animal.species}
            />
            <CreateAnimalEventForm
              animalName={animal.name}
              errorMessage={
                createEvent.error ? toCreateAnimalEventErrorMessage(createEvent.error) : null
              }
              intakeDate={animal.intakeDate}
              isSubmitting={createEvent.isPending}
              onCancel={() => navigateBack(fallbackHref)}
              onSubmit={handleSubmit}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
