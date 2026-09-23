import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { AppText } from '@/components/primitives';
import { AnimalCreateForm } from '@/features/animals/components/AnimalCreateForm';
import { useCreateAnimal } from '@/features/animals/hooks/useCreateAnimal';
import { toCreateAnimalErrorMessage } from '@/features/animals/utils/animalErrorMessages';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

function goBack(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/explore');
  }
}

export default function NewAnimalScreen() {
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;
  const createAnimal = useCreateAnimal();

  if (!canWrite) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EmptyState
            actionLabel="Volver"
            message="Tu rol permite consultar animales, pero no dar de alta nuevos registros."
            onAction={goBack}
            title="Sin permiso"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="heading1">Alta de animal</AppText>
        <AppText color="textSecondary">
          Completa la ficha general. El evento de ingreso se genera automáticamente.
        </AppText>
        <AnimalCreateForm
          errorMessage={createAnimal.error ? toCreateAnimalErrorMessage(createAnimal.error) : null}
          isSubmitting={createAnimal.isPending}
          onCancelUpload={createAnimal.cancelUpload}
          onSubmit={(input) =>
            createAnimal.mutate(input, {
              onSuccess: (animal) => {
                router.replace({ pathname: '/animals/[id]', params: { id: animal.id } });
              },
            })
          }
          upload={createAnimal.upload}
        />
      </ScrollView>
    </SafeAreaView>
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
