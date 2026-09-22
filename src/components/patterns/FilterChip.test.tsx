import { fireEvent, render } from '@testing-library/react-native';

import { FilterChip } from './FilterChip';

describe('FilterChip', () => {
  it('exposes its state to assistive technologies', async () => {
    const screen = await render(
      <FilterChip label="Pendientes" onPress={() => undefined} selected />
    );

    const chip = screen.getByRole('button', { name: 'Pendientes' });
    expect(chip).toBeTruthy();
    expect(chip.props.accessibilityState).toMatchObject({ selected: true });
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const screen = await render(<FilterChip label="Todas" onPress={onPress} selected={false} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Todas' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the provided accessibility label', async () => {
    const screen = await render(
      <FilterChip
        accessibilityLabel="Filtrar por estado Pendientes"
        label="Pendientes"
        onPress={() => undefined}
        selected={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Filtrar por estado Pendientes' })).toBeTruthy();
  });
});
