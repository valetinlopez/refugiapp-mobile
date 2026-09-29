import { useLocalSearchParams, type Href } from 'expo-router';
import { useRef, type RefObject } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AnimalProfileForm } from '@/features/animals/components/AnimalProfileForm';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useSession } from '@/features/auth/session';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';
import { useUpdateAnimal, type UpdateAnimalInput } from '@/features/animals/hooks/useUpdateAnimal';
import {
  toUpdateAnimalErrorMessage,
  UpdateAnimalError,
} from '@/features/animals/utils/animalErrorMessages';
import { isUuid } from '@/features/animals/utils/uuid';
import { colors, spacing } from '@/theme';

export default function EditAnimalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;

  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = animalId
    ? { pathname: '/animals/[id]', params: { id: animalId } }
    : '/explore';
  const animalQuery = useAnimal(animalId);
  const photoQuery = useAnimalPhoto(animalQuery.data?.profilePhotoMediaId ?? null);
  const updateAnimal = useUpdateAnimal(animalId);
  const scrollRef = useRef<ScrollView>(null);

  const updateError = updateAnimal.error;
  const phase = updateError instanceof UpdateAnimalError ? updateError.phase : 'update';
  const updateMessage = updateError ? toUpdateAnimalErrorMessage(updateError) : null;
  const photoErrorMessage = phase === 'photo' ? updateMessage : null;
  const errorMessage = phase === 'update' ? updateMessage : null;

  if (!canWrite) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver al detalle del animal"
          fallbackHref={fallbackHref}
        />
        <View style={styles.container}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol permite consultar animales, pero no editar su ficha."
            onAction={() => navigateBack(fallbackHref)}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AccountHeaderRow
        accessibilityHint="Volver al detalle del animal"
        fallbackHref={fallbackHref}
      />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <AppText variant="heading1">Editar animal</AppText>
        <AppText color="textSecondary">
          Actualizá la ficha general. El estado se cambia desde el detalle del animal.
        </AppText>
        <EditForm
          currentPhotoUri={photoQuery.data ?? null}
          errorMessage={errorMessage}
          isSubmitting={updateAnimal.isPending}
          onBack={() => navigateBack(fallbackHref)}
          onCancelUpload={updateAnimal.cancelUpload}
          onRetry={() => void animalQuery.refetch()}
          onSubmit={(input) =>
            updateAnimal.mutate(input, {
              onSuccess: () => navigateBack(fallbackHref),
            })
          }
          photoErrorMessage={photoErrorMessage}
          query={animalQuery}
          scrollRef={scrollRef}
          upload={updateAnimal.upload}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface EditFormProps {
  currentPhotoUri: string | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  onBack(): void;
  onRetry(): void;
  onCancelUpload(): void;
  onSubmit(input: UpdateAnimalInput): void;
  photoErrorMessage: string | null;
  query: ReturnType<typeof useAnimal>;
  scrollRef: RefObject<ScrollView | null>;
  upload: { fileName: string; progress: number } | null;
}

function EditForm({
  currentPhotoUri,
  errorMessage,
  isSubmitting,
  onBack,
  onCancelUpload,
  onRetry,
  onSubmit,
  photoErrorMessage,
  query,
  scrollRef,
  upload,
}: EditFormProps) {
  if (query.isPending) {
    return <LoadingState label="Cargando ficha" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar la ficha del animal. Revisá tu conexión e intentá de nuevo."
        onAction={onRetry}
        title="No se pudo cargar la ficha"
      />
    );
  }

  if (query.data === undefined) {
    return (
      <EmptyState
        actionLabel="Volver"
        message="El animal que querés editar ya no está disponible."
        onAction={onBack}
        title="Animal no encontrado"
      />
    );
  }

  return (
    <AnimalProfileForm
      currentPhotoUri={currentPhotoUri}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      mode="edit"
      animal={query.data}
      onCancelUpload={onCancelUpload}
      onSubmit={onSubmit}
      photoErrorMessage={photoErrorMessage}
      scrollRef={scrollRef}
      upload={upload}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
