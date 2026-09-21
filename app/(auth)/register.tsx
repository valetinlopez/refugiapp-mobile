import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, fontFamilies, spacing } from '@/theme';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <AppText variant="heading1">Crear cuenta</AppText>
      <Link href="/login" style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  link: {
    color: colors.positive,
    fontFamily: fontFamilies.bodyStrong,
    fontSize: 14,
    marginTop: spacing.lg,
  },
});
