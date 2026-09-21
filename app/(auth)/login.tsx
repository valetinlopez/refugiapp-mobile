import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, fontFamilies, spacing } from '@/theme';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <AppText variant="display">Refugiapp</AppText>
      <AppText color="textSecondary" variant="heading3">
        Iniciar sesión
      </AppText>
      <Link href="/register" style={styles.link}>
        ¿No tienes cuenta? Regístrate
      </Link>
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
  link: {
    color: colors.positive,
    fontFamily: fontFamilies.bodyStrong,
    fontSize: 14,
    marginTop: spacing.md,
  },
});
