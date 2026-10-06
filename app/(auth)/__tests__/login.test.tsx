import { render } from '@testing-library/react-native';

import { useSession } from '@/features/auth/session';

import LoginScreen from '../login';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@/features/auth/session', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;

describe('LoginScreen (RFG-137)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ notice: null, signIn: jest.fn() });
  });

  it('composes the editorial header, the access card and the form', async () => {
    const screen = await render(<LoginScreen />);

    expect(screen.getByTestId('login-brand')).toHaveTextContent('Refugiapp');
    expect(screen.getByText('Cuidar también es organizar')).toBeTruthy();
    expect(screen.getByText('Acceso para personal autorizado')).toBeTruthy();
    expect(screen.getByTestId('login-card')).toBeTruthy();
    expect(screen.getByTestId('login-form')).toBeTruthy();
  });

  it('keeps the functional copy native and the hero decorative', async () => {
    const screen = await render(<LoginScreen />);

    const hero = screen.getByTestId('login-hero', { includeHiddenElements: true });
    expect(hero.props.accessible).toBe(false);
    expect(hero.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('surfaces a session notice as an accessible alert', async () => {
    mockUseSession.mockReturnValue({
      notice: 'Tu sesión venció. Iniciá sesión nuevamente.',
      signIn: jest.fn(),
    });
    const screen = await render(<LoginScreen />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Tu sesión venció. Iniciá sesión nuevamente.'
    );
  });
});
