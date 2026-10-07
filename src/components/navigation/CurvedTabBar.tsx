import type { ComponentProps } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { Tabs } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, sizes } from '@/theme';

import type { AppIconName } from '../primitives';
import { BottomNavigation, type BottomNavigationItem } from './BottomNavigation';
import { tabBarCurveArchPath, tabBarCurvePath } from './tabBarCurve';

export type TabPresentationEntry = {
  icon: AppIconName;
  label: string;
};

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

type TabOptions = {
  href?: unknown;
  tabBarAccessibilityLabel?: string;
};

export type CurvedTabBarProps = BottomTabBarProps & {
  presentation: Record<string, TabPresentationEntry | undefined>;
};

/**
 * Production bottom navigation (RFG-138): replaces the native Expo Router tab
 * bar with a shared `BottomNavigation` row over a static SVG arch. The arch is
 * decorative (hidden from assistive technology) and the row keeps the
 * `tablist`/`tab` semantics, active pill and 44 × 44 targets. It never knows
 * concrete routes: the caller passes the label/icon presentation per route.
 */
export function CurvedTabBar({
  descriptors,
  insets,
  navigation,
  presentation,
  state,
}: CurvedTabBarProps) {
  const { width } = useWindowDimensions();
  const curve = sizes.bottomNavigationCurve;
  const barHeight = sizes.bottomNavigationHeight;
  const totalHeight = curve + barHeight + insets.bottom;

  const items: BottomNavigationItem[] = [];
  for (const route of state.routes) {
    const options = descriptors[route.key]?.options as TabOptions | undefined;
    if (options?.href === null) {
      continue;
    }
    const entry = presentation[route.name];
    if (!entry) {
      continue;
    }
    items.push({
      accessibilityLabel: options?.tabBarAccessibilityLabel ?? entry.label,
      icon: entry.icon,
      id: route.name,
      label: entry.label,
    });
  }

  const activeId = state.routes[state.index]?.name ?? '';

  const handleSelect = (id: string) => {
    const route = state.routes.find((candidate) => candidate.name === id);
    if (!route || route.name === activeId) {
      return;
    }
    const event = navigation.emit({
      canPreventDefault: true,
      target: route.key,
      type: 'tabPress',
    });
    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        <Svg height={totalHeight} width={width}>
          <Rect
            fill={colors.background}
            height={totalHeight}
            testID="tab-bar-backdrop"
            width={width}
            x={0}
            y={0}
          />
          <Path d={tabBarCurvePath(width, totalHeight, curve)} fill={colors.surfaceSubtle} />
          <Path
            d={tabBarCurveArchPath(width, curve)}
            fill="none"
            stroke={colors.border}
            strokeWidth={sizes.divider}
          />
        </Svg>
      </View>
      <View style={[styles.items, { paddingBottom: insets.bottom }]}>
        <BottomNavigation
          activeId={activeId}
          items={items}
          onSelect={handleSelect}
          style={styles.bar}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.transparent,
    borderRadius: 0,
    borderWidth: 0,
  },
  container: {
    backgroundColor: colors.transparent,
    width: '100%',
  },
  items: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
