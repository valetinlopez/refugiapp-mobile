import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { colors, spacing } from '@/theme';

export default function InboxScreen() {
  return (
    <View style={styles.container}>
      <AppText variant="heading1">Bandeja</AppText>
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
});
