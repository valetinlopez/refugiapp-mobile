import { fireEvent, render } from '@testing-library/react-native';

import { colors } from '@/theme';

import { CurvedTabBar, type CurvedTabBarProps, type TabPresentationEntry } from './CurvedTabBar';

const presentation: Record<string, TabPresentationEntry> = {
  index: { icon: 'home', label: 'Inicio' },
  explore: { icon: 'paw', label: 'Animales' },
  'care-tasks': { icon: 'calendar', label: 'Cuidados' },
  more: { icon: 'menu', label: 'Más' },
};

function createProps(activeIndex = 0) {
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const navigate = jest.fn();
  const props = {
    descriptors: {
      'index-key': { options: { tabBarAccessibilityLabel: 'Inicio' } },
      'explore-key': { options: { tabBarAccessibilityLabel: 'Animales' } },
      'care-tasks-key': { options: { tabBarAccessibilityLabel: 'Cuidados' } },
      'more-key': { options: { tabBarAccessibilityLabel: 'Más' } },
      'inbox-key': { options: { href: null } },
    },
    insets: { bottom: 24, left: 0, right: 0, top: 0 },
    navigation: { emit, navigate },
    presentation,
    state: {
      index: activeIndex,
      key: 'tabs',
      routeNames: ['index', 'explore', 'care-tasks', 'more', 'inbox'],
      routes: [
        { key: 'index-key', name: 'index' },
        { key: 'explore-key', name: 'explore' },
        { key: 'care-tasks-key', name: 'care-tasks' },
        { key: 'more-key', name: 'more' },
        { key: 'inbox-key', name: 'inbox' },
      ],
      stale: false,
      type: 'tab',
    },
  } as unknown as CurvedTabBarProps;

  return { emit, navigate, props };
}

describe('CurvedTabBar', () => {
  it('renders the authorized destinations and drops hidden routes', async () => {
    const { props } = createProps();
    const screen = await render(<CurvedTabBar {...props} />);

    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getByRole('tab', { name: 'Cuidados' })).toBeTruthy();
    expect(screen.queryByRole('tab', { name: 'Inbox' })).toBeNull();
  });

  it('paints a backdrop matching the screen background behind the arch', async () => {
    const { props } = createProps();
    const screen = await render(<CurvedTabBar {...props} />);

    const fill = screen.getByTestId('tab-bar-backdrop', { includeHiddenElements: true }).props
      .fill as number | { payload: number };
    const payload = typeof fill === 'number' ? fill : fill.payload;
    const expected = Number.parseInt(`ff${colors.background.replace('#', '')}`, 16);

    expect(payload).toBe(expected);
  });

  it('marks the active destination as selected', async () => {
    const { props } = createProps(2);
    const screen = await render(<CurvedTabBar {...props} />);

    expect(screen.getByRole('tab', { name: 'Cuidados' }).props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('navigates through the tabPress event when a destination is pressed', async () => {
    const { emit, navigate, props } = createProps();
    const screen = await render(<CurvedTabBar {...props} />);

    fireEvent.press(screen.getByRole('tab', { name: 'Animales' }));

    expect(emit).toHaveBeenCalledWith({
      canPreventDefault: true,
      target: 'explore-key',
      type: 'tabPress',
    });
    expect(navigate).toHaveBeenCalledWith('explore');
  });

  it('respects a prevented tabPress event', async () => {
    const { emit, navigate, props } = createProps();
    emit.mockReturnValue({ defaultPrevented: true });
    const screen = await render(<CurvedTabBar {...props} />);

    fireEvent.press(screen.getByRole('tab', { name: 'Animales' }));

    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not re-navigate when the active destination is pressed', async () => {
    const { emit, navigate, props } = createProps();
    const screen = await render(<CurvedTabBar {...props} />);

    fireEvent.press(screen.getByRole('tab', { name: 'Inicio' }));

    expect(emit).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
