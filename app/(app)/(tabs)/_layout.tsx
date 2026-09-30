import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/primitives';
import { useAuthorizedNavigation } from '@/features/auth/hooks/useCapabilities';
import { colors, fontFamilies, sizes } from '@/theme';

const TAB_DESTINATIONS = [
  { name: 'index' },
  { name: 'explore' },
  { name: 'care-tasks' },
  { name: 'more' },
] as const;

export default function TabsLayout() {
  const authorizedTabs = useAuthorizedNavigation(TAB_DESTINATIONS);
  const authorizedTabNames = new Set(authorizedTabs.map(({ name }) => name));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.positive,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarItemStyle: { minHeight: sizes.touchTarget },
        tabBarLabelStyle: { fontFamily: fontFamilies.bodyStrong },
        tabBarStyle: {
          backgroundColor: colors.surfaceSubtle,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          ...(authorizedTabNames.has('index') ? {} : { href: null }),
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="home" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          ...(authorizedTabNames.has('explore') ? {} : { href: null }),
          title: 'Animales',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="paw" />,
        }}
      />
      <Tabs.Screen
        name="care-tasks"
        options={{
          ...(authorizedTabNames.has('care-tasks') ? {} : { href: null }),
          title: 'Tareas',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="calendar" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          ...(authorizedTabNames.has('more') ? {} : { href: null }),
          title: 'Más',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="menu" />,
        }}
      />
      <Tabs.Screen name="inbox" options={{ href: null }} />
    </Tabs>
  );
}

function TabBarIcon({ color, name }: { color: ColorValue; name: AppIconName }) {
  return <AppIcon color={color} name={name} />;
}
