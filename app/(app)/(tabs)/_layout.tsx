import { Tabs } from 'expo-router';

import { CurvedTabBar, type TabPresentationEntry } from '@/components/navigation';
import { useAuthorizedNavigation } from '@/features/auth/hooks/useCapabilities';

type TabDestinationName = 'index' | 'explore' | 'care-tasks' | 'more';

const TAB_DESTINATIONS: readonly { name: TabDestinationName }[] = [
  { name: 'index' },
  { name: 'explore' },
  { name: 'care-tasks' },
  { name: 'more' },
];

const TAB_PRESENTATION: Record<TabDestinationName, TabPresentationEntry> = {
  index: { icon: 'home', label: 'Inicio' },
  explore: { icon: 'paw', label: 'Animales' },
  'care-tasks': { icon: 'calendar', label: 'Cuidados' },
  more: { icon: 'menu', label: 'Más' },
};

function buildTabOptions(name: TabDestinationName, authorizedTabNames: ReadonlySet<string>) {
  const { label } = TAB_PRESENTATION[name];

  return {
    ...(authorizedTabNames.has(name) ? {} : { href: null }),
    tabBarAccessibilityLabel: label,
    title: label,
  };
}

export default function TabsLayout() {
  const authorizedTabs = useAuthorizedNavigation(TAB_DESTINATIONS);
  const authorizedTabNames = new Set(authorizedTabs.map(({ name }) => name));

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CurvedTabBar {...props} presentation={TAB_PRESENTATION} />}
    >
      <Tabs.Screen name="index" options={buildTabOptions('index', authorizedTabNames)} />
      <Tabs.Screen name="explore" options={buildTabOptions('explore', authorizedTabNames)} />
      <Tabs.Screen name="care-tasks" options={buildTabOptions('care-tasks', authorizedTabNames)} />
      <Tabs.Screen name="more" options={buildTabOptions('more', authorizedTabNames)} />
      <Tabs.Screen name="inbox" options={{ href: null }} />
    </Tabs>
  );
}
