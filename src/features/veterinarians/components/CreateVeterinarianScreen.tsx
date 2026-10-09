import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';

import { navigateBack } from '@/components/navigation';
import { DecorativeBackground, ScreenHeader } from '@/components/patterns';
import { AppText } from '@/components/primitives';
import { sizes, spacing } from '@/theme';

import { useCreateVeterinarian } from '../hooks/useVeterinarianMutations';
import { toCreateVeterinarianRequest } from '../utils/veterinarianMappers';
import { toVeterinarianCreateErrorPresentation } from '../utils/veterinarianPresentation';
import { VeterinarianForm } from './VeterinarianForm';

/**
 * D29 create flow. The backend receives one `POST /veterinarians` request and
 * owns the atomic profile + access-account transaction; the password remains
 * only in React Hook Form memory until submit.
 */
export function CreateVeterinarianScreen() {
  const createVeterinarian = useCreateVeterinarian();
  const errorPresentation = createVeterinarian.error
    ? toVeterinarianCreateErrorPresentation(createVeterinarian.error)
    : null;
  const serverErrors =
    errorPresentation?.field !== null && errorPresentation?.field !== undefined
      ? { [errorPresentation.field]: errorPresentation.message }
      : undefined;

  return (
    <View style={styles.fill}>
      <DecorativeBackground overlay variant="texture" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        testID="create-veterinarian-screen"
      >
        <AppText color="textSecondary" variant="label">
          Veterinarios
        </AppText>
        <ScreenHeader
          subtitle="Creá un perfil profesional"
          title="Nuevo veterinario"
          titleVariant="display"
        />
        <VeterinarianForm
          errorMessage={errorPresentation?.field === null ? errorPresentation.message : null}
          isSubmitting={createVeterinarian.isPending}
          mode="create"
          onCancel={() => navigateBack('/veterinarians')}
          onFieldChange={createVeterinarian.reset}
          onSubmit={(values) =>
            createVeterinarian.mutate(toCreateVeterinarianRequest(values), {
              onSuccess: () => {
                AccessibilityInfo.announceForAccessibility('Veterinario creado correctamente.');
                navigateBack('/veterinarians');
              },
            })
          }
          serverErrors={serverErrors}
          submitLabel="Crear perfil"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: sizes.contentMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  fill: { flex: 1 },
});
