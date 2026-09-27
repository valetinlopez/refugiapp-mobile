import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppHeaderBack, navigateBack } from './AppHeaderBack';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() },
}));

const { router } = jest.requireMock('expo-router') as {
  router: { back: jest.Mock; canGoBack: jest.Mock; replace: jest.Mock };
};

const FALLBACK_HREF = '/explore';

describe('AppHeaderBack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a Volver button with an accessible label and hint', async () => {
    const screen = await render(
      <AppHeaderBack
        accessibilityHint="Volver a la lista de animales"
        fallbackHref={FALLBACK_HREF}
      />
    );

    const button = screen.getByRole('button', { name: 'Volver' });
    expect(button.props.accessibilityHint).toBe('Volver a la lista de animales');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('keeps a 44x44 minimum touch target and allows font scaling', async () => {
    const screen = await render(<AppHeaderBack fallbackHref={FALLBACK_HREF} />);

    const button = screen.getByRole('button', { name: 'Volver' });
    const flattened = StyleSheet.flatten(button.props.style) as {
      minHeight: number;
      minWidth: number;
    };
    expect(flattened.minHeight).toBe(44);
    expect(flattened.minWidth).toBe(44);

    const label = screen.getByText('Volver');
    expect(label.props.allowFontScaling).toBe(true);
    expect(label.props.maxFontSizeMultiplier).toBe(1.8);
  });

  it('goes back when navigation history exists', async () => {
    router.canGoBack.mockReturnValue(true);
    const screen = await render(<AppHeaderBack fallbackHref={FALLBACK_HREF} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('replaces with the fallback when opened as a deep link without history', async () => {
    router.canGoBack.mockReturnValue(false);
    const screen = await render(<AppHeaderBack fallbackHref={FALLBACK_HREF} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));

    expect(router.replace).toHaveBeenCalledWith(FALLBACK_HREF);
    expect(router.back).not.toHaveBeenCalled();
  });

  it('supports a custom label', async () => {
    const screen = await render(<AppHeaderBack fallbackHref={FALLBACK_HREF} label="Atrás" />);

    expect(screen.getByRole('button', { name: 'Atrás' })).toBeTruthy();
  });
});

describe('navigateBack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('backs out when there is history and replaces otherwise', () => {
    router.canGoBack.mockReturnValue(true);
    navigateBack(FALLBACK_HREF);
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();

    jest.clearAllMocks();

    router.canGoBack.mockReturnValue(false);
    navigateBack(FALLBACK_HREF);
    expect(router.replace).toHaveBeenCalledWith(FALLBACK_HREF);
    expect(router.back).not.toHaveBeenCalled();
  });
});
