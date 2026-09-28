import type { Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeaderBack } from '@/components/navigation';
import { spacing } from '@/theme';

import { AccountMenuButton } from './AccountMenuButton';

export type AccountHeaderRowProps = {
  accessibilityHint?: string;
  fallbackHref: Href;
  label?: string;
};

export function AccountHeaderRow({
  accessibilityHint,
  fallbackHref,
  label,
}: AccountHeaderRowProps) {
  return (
    <View style={styles.row}>
      <AppHeaderBack
        {...(accessibilityHint === undefined ? {} : { accessibilityHint })}
        fallbackHref={fallbackHref}
        {...(label === undefined ? {} : { label })}
      />
      <AccountMenuButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
});
