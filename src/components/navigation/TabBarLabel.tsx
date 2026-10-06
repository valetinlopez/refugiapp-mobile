import { StyleSheet } from 'react-native';

import { AppText } from '@/components/primitives';
import { fontFamilies } from '@/theme';

export type TabBarLabelProps = {
  children: string;
  focused: boolean;
};

export function TabBarLabel({ children, focused }: TabBarLabelProps) {
  return (
    <AppText
      color={focused ? 'positive' : 'textSecondary'}
      numberOfLines={1}
      style={focused ? styles.active : undefined}
      variant="caption"
    >
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  active: {
    fontFamily: fontFamilies.bodyStrong,
  },
});
