import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

export default function ExploreScreen() {
  const { user } = useSession();
  const canWrite =
    user?.roles.some((role) => role === 'admin' || role === 'shelter_manager') ?? false;

  return (
    <View style={styles.container}>
      <AppText variant="heading1">Animales</AppText>
      {canWrite ? (
        <AppButton label="Dar de alta un animal" onPress={() => router.push('/animals/new')} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
