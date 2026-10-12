import { fireEvent, render } from '@testing-library/react-native';

import { HOME_HERO_TAGLINE, HomeGreeting } from './HomeGreeting';
import { formatHomeDate, getSessionGreeting } from '../utils/greeting';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock };
};

describe('HomeGreeting (D36 / RFG-169, D38.3 / RFG-174, D39.1 / RFG-175)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the greeting and the local es-AR date from the session', async () => {
    const now = new Date('2026-10-10T10:00:00-03:00');
    const screen = await render(<HomeGreeting firstName="Andrés" now={now} />);

    expect(screen.getByText(getSessionGreeting('Andrés', now))).toBeTruthy();
    expect(screen.getByText(formatHomeDate(now))).toBeTruthy();
  });

  it('renders a single header with the heading role', async () => {
    const now = new Date('2026-10-10T10:00:00-03:00');
    const screen = await render(<HomeGreeting firstName="Andrés" now={now} />);

    expect(screen.getAllByRole('header')).toHaveLength(1);
  });

  it('renders the native caption when provided', async () => {
    const screen = await render(<HomeGreeting caption={HOME_HERO_TAGLINE} firstName="Andrés" />);

    expect(screen.getByText(HOME_HERO_TAGLINE)).toBeTruthy();
  });

  it('omits the caption when none is provided', async () => {
    const screen = await render(<HomeGreeting firstName="Andrés" />);

    expect(screen.queryByText(HOME_HERO_TAGLINE)).toBeNull();
  });

  it('keeps the profile shortcut accessible with initials and navigates to the profile', async () => {
    const screen = await render(<HomeGreeting firstName="Andrés" lastName="Borrego" />);

    const profile = screen.getByRole('button', { name: 'Abrir perfil' });
    expect(profile).toBeTruthy();
    expect(screen.getByText('AB')).toBeTruthy();

    await fireEvent.press(profile);
    expect(router.push).toHaveBeenCalledWith('/profile');
  });

  it('keeps the notifications shortcut accessible and navigates to More', async () => {
    const screen = await render(<HomeGreeting firstName="Andrés" />);

    const notifications = screen.getByRole('button', { name: 'Abrir notificaciones' });
    expect(notifications).toBeTruthy();

    await fireEvent.press(notifications);
    expect(router.push).toHaveBeenCalledWith('/more');
  });
});
