import { fireEvent, render } from '@testing-library/react-native';

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
});
