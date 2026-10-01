import { fireEvent, render } from '@testing-library/react-native';

import { AppButton } from './AppButton';

describe('AppButton', () => {
  it('announces its label and handles presses', async () => {
    const onPress = jest.fn();
    const screen = await render(<AppButton label="Guardar" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not handle presses while disabled', async () => {
    const onPress = jest.fn();
    const screen = await render(<AppButton disabled label="Guardar" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes a busy state while loading', async () => {
    const screen = await render(<AppButton label="Guardar" loading />);

    expect(screen.getByRole('button', { name: 'Guardar' }).props.accessibilityState).toEqual({
      busy: true,
      disabled: true,
    });
  });

  it('applies the 44x44 minimum target with a default hitSlop (RFG-88)', async () => {
    const screen = await render(<AppButton label="Guardar" onPress={() => undefined} />);

    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button.props.hitSlop).toEqual(8);
  });

  it('keeps an accessible label when showing an icon-only action (RFG-88)', async () => {
    const screen = await render(
      <AppButton accessibilityLabel="Cerrar" label="X" onPress={() => undefined} />
    );

    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeTruthy();
  });
});
