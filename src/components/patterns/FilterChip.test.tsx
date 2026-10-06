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

  it('exposes a minimum touch target with hitSlop (RFG-88)', async () => {
    const screen = await render(
      <FilterChip label="Todas" onPress={() => undefined} selected={false} />
    );

    expect(screen.getByRole('button', { name: 'Todas' }).props.hitSlop).toEqual(8);
  });

  it('forwards a testID to the pressable for deterministic E2E selectors', async () => {
    const screen = await render(
      <FilterChip
        label="Pendientes"
        onPress={() => undefined}
        selected
        testID="chip-status-pending"
      />
    );

    expect(screen.getByTestId('chip-status-pending')).toBeTruthy();
  });

  it('exposes radio semantics (checked) inside a segmented group', async () => {
    const screen = await render(
      <FilterChip accessibilityRole="radio" label="Pendientes" onPress={() => undefined} selected />
    );

    const radio = screen.getByRole('radio', { name: 'Pendientes' });
    expect(radio.props.accessibilityState).toMatchObject({ checked: true });
  });

  it('blocks interaction and announces the disabled state', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <FilterChip disabled label="Pendientes" onPress={onPress} selected={false} />
    );

    const chip = screen.getByRole('button', { name: 'Pendientes' });
    expect(chip.props.accessibilityState).toMatchObject({ disabled: true });

    await fireEvent.press(chip);
    expect(onPress).not.toHaveBeenCalled();
  });
});
