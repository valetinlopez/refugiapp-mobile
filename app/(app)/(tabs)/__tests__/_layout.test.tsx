import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { colors, sizes } from '@/theme';

import TabsLayout from '../_layout';

type CapturedScreen = { name: string; options: Record<string, unknown> };

const mockTabs: {
  screens: CapturedScreen[];
  screenOptions: Record<string, unknown> | undefined;
} = { screens: [], screenOptions: undefined };

const mockAuthorization: { visible: string[] | undefined } = { visible: undefined };

jest.mock('expo-router', () => {
  function toScreenElement(
    value: unknown
  ): { name: string; options: Record<string, unknown> } | null {
    if (typeof value === 'object' && value !== null && 'props' in value) {
      const props = (value as { props: { name?: string; options?: Record<string, unknown> } })
        .props;
      return { name: props.name ?? '', options: props.options ?? {} };
    }
    return null;
  }

  function Tabs({
    children,
    screenOptions,
  }: {
    children?: unknown;
    screenOptions?: Record<string, unknown>;
  }) {
    mockTabs.screenOptions = screenOptions;
    const items = Array.isArray(children) ? children : [children];
    for (const item of items) {
      const element = toScreenElement(item);
      if (element) {
        mockTabs.screens.push(element);
      }
    }
    return null;
  }

  Tabs.Screen = function TabsScreen() {
    return null;
  };

  return { Tabs };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 24, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/auth/hooks/useCapabilities', () => ({
  useAuthorizedNavigation: (destinations: readonly { name: string }[]) =>
    mockAuthorization.visible === undefined
      ? destinations
      : destinations.filter((destination) => mockAuthorization.visible?.includes(destination.name)),
}));

function mainScreens() {
  return mockTabs.screens.filter((screen) => screen.name !== 'inbox');
}

describe('TabsLayout', () => {
  beforeEach(() => {
    mockTabs.screens = [];
    mockTabs.screenOptions = undefined;
    mockAuthorization.visible = undefined;
  });

  it('registers the four main destinations with Cuidados as the visible label', async () => {
    await render(<TabsLayout />);

    expect(mainScreens().map((screen) => screen.name)).toEqual([
      'index',
      'explore',
      'care-tasks',
      'more',
    ]);
    expect(mainScreens().map((screen) => screen.options.title)).toEqual([
      'Inicio',
      'Animales',
      'Cuidados',
      'Más',
    ]);
  });

  it('exposes a Spanish accessibility label matching each title', async () => {
    await render(<TabsLayout />);

    expect(
      mainScreens().every(
        (screen) => screen.options.tabBarAccessibilityLabel === screen.options.title
      )
    ).toBe(true);
  });

  it('keeps every destination enabled for roles without capability restrictions', async () => {
    await render(<TabsLayout />);

    expect(mainScreens().some((screen) => 'href' in screen.options)).toBe(false);
  });

  it('hides destinations the session is not authorized to reach', async () => {
    mockAuthorization.visible = ['index', 'care-tasks', 'more'];
    await render(<TabsLayout />);

    const explore = mockTabs.screens.find((screen) => screen.name === 'explore');
    expect(explore?.options.href).toBeNull();
  });

  it('keeps the legacy inbox route hidden', async () => {
    await render(<TabsLayout />);

    const inbox = mockTabs.screens.find((screen) => screen.name === 'inbox');
    expect(inbox?.options).toEqual({ href: null });
  });

  it('reserves the base height plus the bottom safe-area inset', async () => {
    await render(<TabsLayout />);

    const style = mockTabs.screenOptions?.tabBarStyle as {
      backgroundColor: string;
      height: number;
      paddingBottom: number;
    };
    expect(style.height).toBe(sizes.bottomNavigationHeight + 24);
    expect(style.paddingBottom).toBe(24);
    expect(style.backgroundColor).toBe(colors.surfaceSubtle);
  });

  it('renders the shared tab icon and label for the Cuidados destination', async () => {
    await render(<TabsLayout />);

    const care = mockTabs.screens.find((screen) => screen.name === 'care-tasks');
    const renderIcon = care?.options.tabBarIcon as (args: { focused: boolean }) => ReactElement;
    const renderLabel = care?.options.tabBarLabel as (args: {
      focused: boolean;
      children: string;
    }) => ReactElement;

    const screen = await render(
      <>
        {renderIcon({ focused: true })}
        {renderLabel({ focused: true, children: 'Cuidados' })}
      </>
    );

    expect(screen.getByTestId('tab-bar-icon-calendar')).toBeTruthy();
    expect(screen.getByText('Cuidados')).toBeTruthy();
  });
});
