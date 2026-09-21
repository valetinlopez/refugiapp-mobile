import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, fontFamilies, spacing } from '@/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrada' }} />
      <View style={styles.container}>
        <AppText variant="heading2">Esta pantalla no existe</AppText>
        <Link href="/" style={styles.link}>
          Volver al inicio
        </Link>
      </View>
    </>
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
  link: {
    color: colors.positive,
    fontFamily: fontFamilies.bodyStrong,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
});
