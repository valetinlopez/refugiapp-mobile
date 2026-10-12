import { render } from '@testing-library/react-native';

import { HOME_HERO_TAGLINE, HomeGreeting } from './HomeGreeting';
import { formatHomeDate, getSessionGreeting } from '../utils/greeting';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

describe('HomeGreeting (D36 / RFG-169, D38.3 / RFG-174)', () => {
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

  it('keeps the account shortcut accessible', async () => {
    const screen = await render(<HomeGreeting firstName="Andrés" />);

    expect(screen.getByRole('button', { name: 'Abrir menú de cuenta' })).toBeTruthy();
  });
});
