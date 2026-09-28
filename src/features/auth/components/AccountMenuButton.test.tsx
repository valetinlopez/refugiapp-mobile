import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AccountMenuButton } from './AccountMenuButton';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock };
};

describe('AccountMenuButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the account screen with an accessible label', async () => {
    const screen = await render(<AccountMenuButton />);

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir menú de cuenta' }));

    expect(router.push).toHaveBeenCalledWith('/account');
  });

  it('keeps a 44x44 minimum touch target', async () => {
    const screen = await render(<AccountMenuButton />);

    const button = screen.getByRole('button', { name: 'Abrir menú de cuenta' });
    const flattened = StyleSheet.flatten(button.props.style) as {
      minHeight: number;
      minWidth: number;
    };
    expect(flattened.minHeight).toBe(44);
    expect(flattened.minWidth).toBe(44);
  });
});
