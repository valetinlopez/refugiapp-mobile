import { fireEvent, render } from '@testing-library/react-native';

import { FAB } from './FAB';

describe('FAB (RFG-136)', () => {
  it('exposes an accessible button and calls onPress', async () => {
    const onPress = jest.fn();
    const screen = await render(<FAB accessibilityLabel="Nueva tarea" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Nueva tarea' });
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks interaction and announces the busy state while loading', async () => {
    const onPress = jest.fn();
    const screen = await render(<FAB accessibilityLabel="Nueva tarea" loading onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Nueva tarea' });
    expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true });

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('honours the disabled state', async () => {
    const screen = await render(<FAB accessibilityLabel="Nueva tarea" disabled />);

    expect(
      screen.getByRole('button', { name: 'Nueva tarea' }).props.accessibilityState
    ).toMatchObject({ disabled: true });
  });

  it('forwards a testID for deterministic E2E selectors', async () => {
    const screen = await render(
      <FAB accessibilityLabel="Nueva tarea" onPress={() => undefined} testID="fab-new-task" />
    );

    expect(screen.getByTestId('fab-new-task')).toBeTruthy();
  });
});
