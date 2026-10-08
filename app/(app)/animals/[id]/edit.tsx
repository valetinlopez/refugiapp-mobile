import { useLocalSearchParams, useNavigation, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
} from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { DecorativeBackground, ScreenHeader } from '@/components/patterns';
import { isNetworkError } from '@/core/network';
import { AnimalProfileForm } from '@/features/animals/components/AnimalProfileForm';
import { UnsavedChangesIndicator } from '@/features/animals/components/UnsavedChangesIndicator';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';
import { useUnsavedChangesGuard } from '@/features/animals/hooks/useUnsavedChangesGuard';
import { useUpdateAnimal, type UpdateAnimalInput } from '@/features/animals/hooks/useUpdateAnimal';
import {
  toUpdateAnimalErrorMessage,
  UpdateAnimalError,
} from '@/features/animals/utils/animalErrorMessages';
import { isUuid } from '@/features/animals/utils/uuid';
import { colors, spacing } from '@/theme';

export default function EditAnimalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canEditAnimal: canWrite } = useCapabilities();
  const navigation = useNavigation();

  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const fallbackHref: Href = useMemo(
    () => (animalId ? { pathname: '/animals/[id]', params: { id: animalId } } : '/explore'),
    [animalId]
  );
  const animalQuery = useAnimal(animalId);
  const photoQuery = useAnimalPhoto(animalQuery.data?.profilePhotoMediaId ?? null);
  const updateAnimal = useUpdateAnimal(animalId);
  const scrollRef = useRef<ScrollView>(null);
  const [dirty, setDirty] = useState(false);
  const leaving = dirty && !updateAnimal.isPending;

  const leave = useMemo(() => () => navigateBack(fallbackHref), [fallbackHref]);
  const guard = useUnsavedChangesGuard(leaving, leave);

  const updateError = updateAnimal.error;
  const phase = updateError instanceof UpdateAnimalError ? updateError.phase : 'update';
  const updateMessage = updateError ? toUpdateAnimalErrorMessage(updateError) : null;
  const photoErrorMessage = phase === 'photo' ? updateMessage : null;
  const errorMessage = phase === 'update' ? updateMessage : null;

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !leaving });
  }, [navigation, leaving]);

  if (!canWrite) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AccountHeaderRow
          accessibilityHint="Volver al detalle del animal"
          fallbackHref={fallbackHref}
        />
        <View style={styles.centered}>
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
      <DecorativeBackground variant="texture" />
      <AccountHeaderRow
        accessibilityHint="Volver al detalle del animal"
        fallbackHref={fallbackHref}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          {...(dirty ? { actions: <UnsavedChangesIndicator /> } : {})}
          subtitle="Actualizá la ficha general. El estado se cambia desde el detalle del animal."
          title="Editar animal"
        />
        <EditForm
          currentPhotoUri={photoQuery.data ?? null}
          errorMessage={errorMessage}
          isSubmitting={updateAnimal.isPending}
          onBack={() => navigateBack(fallbackHref)}
          onCancelUpload={updateAnimal.cancelUpload}
          onDiscard={() => navigateBack(fallbackHref)}
          onDirtyChange={setDirty}
          onRetry={() => void animalQuery.refetch()}
          onSubmit={(input) =>
            updateAnimal.mutate(input, {
              onSuccess: () => {
                guard.bypassNextRemoval();
                navigateBack(fallbackHref);
              },
            })
          }
          photoErrorMessage={photoErrorMessage}
          query={animalQuery}
          scrollRef={scrollRef}
          upload={updateAnimal.upload}
        />
      </ScrollView>
      <ConfirmDialog
        cancelLabel="Seguir editando"
        confirmLabel="Descartar"
        consequence="Si salís ahora, vas a perder los cambios que no guardaste."
        onCancel={guard.cancelDiscard}
        onConfirm={guard.confirmDiscard}
        title="Cambios sin guardar"
        variant="primary"
        visible={guard.discardVisible}
      />
    </SafeAreaView>
  );
}

interface EditFormProps {
  currentPhotoUri: string | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  onBack(): void;
  onCancelUpload(): void;
  onDiscard(): void;
  onDirtyChange(dirty: boolean): void;
  onRetry(): void;
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
  onDiscard,
  onDirtyChange,
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

  if (query.isError && isNetworkError(query.error)) {
    return (
      <OfflineState
        actionLabel="Reintentar"
        message="No pudimos cargar la ficha sin conexión. Revisá tu red e intentá de nuevo."
        onAction={onRetry}
        title="Estás sin conexión"
      />
    );
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
      animal={query.data}
      currentPhotoUri={currentPhotoUri}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      mode="edit"
      onCancelUpload={onCancelUpload}
      onDiscard={onDiscard}
      onDirtyChange={onDirtyChange}
      onSubmit={onSubmit}
      photoErrorMessage={photoErrorMessage}
      scrollRef={scrollRef}
      upload={upload}
    />
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
