import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/primitives';
import { spacing } from '@/theme';

import type { DashboardQuickAction } from '../utils/quickActions';

export function DashboardQuickActions({ actions }: { actions: readonly DashboardQuickAction[] }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <View accessibilityLabel="Acciones rápidas" style={styles.container}>
      {actions.map((action) => (
        <AppButton
          icon={action.icon}
          key={action.id}
          label={action.label}
          onPress={() => router.push(action.href)}
          variant="secondary"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
