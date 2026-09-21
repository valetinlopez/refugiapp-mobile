import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { AppIcon, AppText, type AppIconName } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

export type BottomNavigationItem = {
  accessibilityLabel?: string;
  icon: AppIconName;
  id: string;
  label: string;
};

export type BottomNavigationProps = ViewProps & {
  activeId: string;
  items: readonly BottomNavigationItem[];
  onSelect: (id: string) => void;
};

export function BottomNavigation({
  activeId,
  items,
  onSelect,
  style,
  ...props
}: BottomNavigationProps) {
  return (
    <View accessibilityRole="tablist" style={[styles.container, style]} {...props}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const color = isActive ? 'positive' : 'textSecondary';

        return (
          <Pressable
            accessibilityLabel={item.accessibilityLabel ?? item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            hitSlop={spacing.xxs}
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <AppIcon color={color} name={item.icon} size={sizes.iconLg} />
            <AppText color={color} numberOfLines={1} variant="caption">
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: sizes.bottomNavigationHeight,
    paddingHorizontal: spacing.xs,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.xxs,
  },
  pressed: {
    opacity: 0.72,
  },
});
