import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarIcon, TabBarLabel } from '@/components/navigation';
import { type AppIconName } from '@/components/primitives';
import { useAuthorizedNavigation } from '@/features/auth/hooks/useCapabilities';
import { colors, sizes, spacing } from '@/theme';

type TabDestinationName = 'index' | 'explore' | 'care-tasks' | 'more';

const TAB_DESTINATIONS: readonly { name: TabDestinationName }[] = [
  { name: 'index' },
  { name: 'explore' },
  { name: 'care-tasks' },
  { name: 'more' },
];

const TAB_PRESENTATION: Record<TabDestinationName, { icon: AppIconName; label: string }> = {
  index: { icon: 'home', label: 'Inicio' },
  explore: { icon: 'paw', label: 'Animales' },
  'care-tasks': { icon: 'calendar', label: 'Cuidados' },
  more: { icon: 'menu', label: 'Más' },
};

function buildTabOptions(name: TabDestinationName, authorizedTabNames: ReadonlySet<string>) {
  const { icon, label } = TAB_PRESENTATION[name];

  return {
    ...(authorizedTabNames.has(name) ? {} : { href: null }),
    tabBarAccessibilityLabel: label,
    tabBarIcon: ({ focused }: { focused: boolean }) => <TabBarIcon focused={focused} name={icon} />,
    tabBarLabel: ({ focused, children }: { focused: boolean; children: string }) => (
      <TabBarLabel focused={focused}>{children}</TabBarLabel>
    ),
    title: label,
  };
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const authorizedTabs = useAuthorizedNavigation(TAB_DESTINATIONS);
  const authorizedTabNames = new Set(authorizedTabs.map(({ name }) => name));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.positive,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: { minHeight: sizes.touchTarget },
        tabBarStyle: {
          backgroundColor: colors.surfaceSubtle,
          borderTopWidth: 0,
          height: sizes.bottomNavigationHeight + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: spacing.xs,
        },
      }}
    >
      <Tabs.Screen name="index" options={buildTabOptions('index', authorizedTabNames)} />
      <Tabs.Screen name="explore" options={buildTabOptions('explore', authorizedTabNames)} />
      <Tabs.Screen name="care-tasks" options={buildTabOptions('care-tasks', authorizedTabNames)} />
      <Tabs.Screen name="more" options={buildTabOptions('more', authorizedTabNames)} />
      <Tabs.Screen name="inbox" options={{ href: null }} />
    </Tabs>
  );
}
