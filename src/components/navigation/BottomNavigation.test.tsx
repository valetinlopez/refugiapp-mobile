import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { colors, fontFamilies } from '@/theme';

import { BottomNavigation, type BottomNavigationItem } from './BottomNavigation';

const items: readonly BottomNavigationItem[] = [
  { icon: 'home', id: 'home', label: 'Inicio' },
  { icon: 'paw', id: 'animals', label: 'Animales' },
];

describe('BottomNavigation', () => {
  it('marks the active item and reports selection', async () => {
    const onSelect = jest.fn();
    const screen = await render(
      <BottomNavigation activeId="home" items={items} onSelect={onSelect} />
    );

    expect(screen.getByRole('tab', { name: 'Inicio' }).props.accessibilityState).toEqual({
      selected: true,
    });

    fireEvent.press(screen.getByRole('tab', { name: 'Animales' }));

    expect(onSelect).toHaveBeenCalledWith('animals');
  });

  it('adds a non-color signal to the active destination', async () => {
    const screen = await render(
      <BottomNavigation activeId="home" items={items} onSelect={jest.fn()} />
    );

    const active = StyleSheet.flatten(screen.getByText('Inicio').props.style) as {
      color: string;
      fontFamily: string;
    };
    const inactive = StyleSheet.flatten(screen.getByText('Animales').props.style) as {
      color: string;
      fontFamily: string;
    };

    expect(active.fontFamily).toBe(fontFamilies.bodyStrong);
    expect(active.color).toBe(colors.positive);
    expect(inactive.fontFamily).toBe(fontFamilies.body);
    expect(inactive.color).toBe(colors.textSecondary);
  });
});
