import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBadge, AppAvatar, AppButton, AppCard, AppText } from '@/components/primitives';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { AnimalStatusChanger } from '@/features/animals/components/AnimalStatusChanger';
import { useSession } from '@/features/auth/session';
import { useAnimal } from '@/features/animals/hooks/useAnimal';
import { useAnimalPhoto } from '@/features/animals/hooks/useAnimalPhoto';
import { useChangeAnimalStatus } from '@/features/animals/hooks/useChangeAnimalStatus';
import { toChangeStatusErrorMessage } from '@/features/animals/utils/animalErrorMessages';
import { getStatusBadge } from '@/features/animals/utils/animalTransitions';
import { isUuid } from '@/features/animals/utils/uuid';
import type { AnimalSex, AnimalStatus } from '@/features/animals/types';
import { colors, spacing } from '@/theme';

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;

  const animalId = typeof id === 'string' && isUuid(id) ? id : '';
  const animalQuery = useAnimal(animalId);
  const photoQuery = useAnimalPhoto(animalQuery.data?.profilePhotoMediaId ?? null);
  const changeStatus = useChangeAnimalStatus(animalId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AnimalDetailContent
          canWrite={canWrite}
          changeStatusError={
            changeStatus.error ? toChangeStatusErrorMessage(changeStatus.error) : null
          }
          isSubmittingStatus={changeStatus.isPending}
          onChangeStatus={(status) => changeStatus.mutate({ status })}
          onRetry={() => void animalQuery.refetch()}
          photoUri={photoQuery.data ?? null}
          query={animalQuery}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function goBack(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/explore');
  }
}

interface AnimalDetailContentProps {
  canWrite: boolean;
  changeStatusError: string | null;
  isSubmittingStatus: boolean;
  onChangeStatus(status: AnimalStatus): void;
  onRetry(): void;
  photoUri: string | null;
  query: ReturnType<typeof useAnimal>;
}

function AnimalDetailContent({
  canWrite,
  changeStatusError,
  isSubmittingStatus,
  onChangeStatus,
  onRetry,
  photoUri,
  query,
}: AnimalDetailContentProps) {
  if (query.isPending) {
    return <LoadingState label="Cargando animal" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar la ficha del animal. Revisa tu conexión e inténtalo de nuevo."
        onAction={onRetry}
        title="No se pudo cargar el animal"
      />
    );
  }

  if (query.data === undefined) {
    return (
      <EmptyState
        actionLabel="Volver"
        message="El animal que buscás ya no está disponible."
        onAction={goBack}
        title="Animal no encontrado"
      />
    );
  }

  const animal = query.data;
  const badge = getStatusBadge(animal.status);

  return (
    <View style={styles.detail}>
      <View style={styles.header}>
        <AppAvatar
          accessibilityLabel={`Foto de ${animal.name}`}
          initials={animal.name.slice(0, 2)}
          size="lg"
          source={photoUri ? { uri: photoUri } : undefined}
        />
        <View style={styles.heading}>
          <AppText variant="heading1">{animal.name}</AppText>
          <AppText color="textSecondary">
            {animal.species}
            {animal.breed ? ` · ${animal.breed}` : ''}
          </AppText>
          <AppBadge icon={badge.icon} label={badge.label} tone={badge.tone} />
        </View>
      </View>

      <AppCard>
        <View style={styles.row}>
          <AppText color="textSecondary" variant="label">
            Sexo
          </AppText>
          <AppText>{sexLabel(animal.sex)}</AppText>
        </View>
        <View style={styles.row}>
          <AppText color="textSecondary" variant="label">
            Fecha de ingreso
          </AppText>
          <AppText>{animal.intakeDate}</AppText>
        </View>
        <View style={styles.row}>
          <AppText color="textSecondary" variant="label">
            Fecha de nacimiento
          </AppText>
          <AppText>{animal.birthDate ?? 'No informada'}</AppText>
        </View>
      </AppCard>

      {canWrite ? (
        <View style={styles.writeSection}>
          <AppButton
            icon="refresh"
            label="Editar ficha"
            onPress={() =>
              router.push({
                pathname: '/animals/[id]/edit',
                params: { id: animal.id },
              })
            }
            variant="secondary"
          />
          <AppText variant="heading2">Cambiar estado</AppText>
          <AnimalStatusChanger
            currentStatus={animal.status}
            errorMessage={changeStatusError}
            onConfirm={onChangeStatus}
            submitting={isSubmittingStatus}
          />
        </View>
      ) : null}
    </View>
  );
}

function sexLabel(sex: AnimalSex): string {
  switch (sex) {
    case 'female':
      return 'Hembra';
    case 'male':
      return 'Macho';
    case 'unknown':
      return 'Desconocido';
  }
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  detail: {
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  heading: {
    flex: 1,
    gap: spacing.xxs,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  writeSection: {
    gap: spacing.md,
  },
});
