import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <AppText variant="heading1">Refugiapp</AppText>
      <AppText color="textSecondary">Bienvenido</AppText>
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
