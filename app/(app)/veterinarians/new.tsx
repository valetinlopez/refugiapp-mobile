import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { navigateBack } from '@/components/navigation';
import { AppText } from '@/components/primitives';
import { AccountHeaderRow } from '@/features/auth/components/AccountHeaderRow';
import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { VeterinarianForm } from '@/features/veterinarians/components/VeterinarianForm';
import { useCreateVeterinarian } from '@/features/veterinarians/hooks/useVeterinarianMutations';
import { toCreateVeterinarianRequest } from '@/features/veterinarians/utils/veterinarianMappers';
import { toVeterinarianErrorMessage } from '@/features/veterinarians/utils/veterinarianPresentation';
import { colors, spacing } from '@/theme';

export default function NewVeterinarianRoute() {
  const { canManageVets } = useCapabilities();
  const createVeterinarian = useCreateVeterinarian();
  const veterinariansHref = '/veterinarians' as Href;

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
            onAction={() => navigateBack('/')}
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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="heading1">Nuevo veterinario</AppText>
        <AppText color="textSecondary">
          La matrícula debe ser única. Podés vincular opcionalmente un usuario interno.
        </AppText>
        <VeterinarianForm
          errorMessage={
            createVeterinarian.error ? toVeterinarianErrorMessage(createVeterinarian.error) : null
          }
          isSubmitting={createVeterinarian.isPending}
          onSubmit={(values) =>
            createVeterinarian.mutate(toCreateVeterinarianRequest(values), {
              onSuccess: () => router.replace(veterinariansHref),
            })
          }
          submitLabel="Crear veterinario"
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
