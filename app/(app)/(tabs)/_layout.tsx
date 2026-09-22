import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/primitives';
import { colors, fontFamilies } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.positive,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fontFamilies.bodyStrong },
        tabBarStyle: {
          backgroundColor: colors.surfaceSubtle,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="home" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Animales',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="paw" />,
        }}
      />
      <Tabs.Screen
        name="care-tasks"
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color }) => <TabBarIcon color={color} name="calendar" />,
        }}
      />
      <Tabs.Screen name="inbox" options={{ href: null }} />
    </Tabs>
  );
}

function TabBarIcon({ color, name }: { color: ColorValue; name: AppIconName }) {
  return <AppIcon color={color} name={name} />;
}
