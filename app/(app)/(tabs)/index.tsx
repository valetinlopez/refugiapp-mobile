import { StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/primitives';
import { useSession } from '@/features/auth/session';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  const { signOut, user } = useSession();

  return (
    <View style={styles.container}>
      <AppText variant="heading1">Refugiapp</AppText>
      <AppText color="textSecondary">Bienvenido, {user?.email}</AppText>
      <AppButton label="Cerrar sesión" onPress={() => void signOut()} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
