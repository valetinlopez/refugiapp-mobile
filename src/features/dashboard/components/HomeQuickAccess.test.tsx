import { fireEvent, render } from '@testing-library/react-native';

import { buildHomeAccessSubtitles, HOME_ACCESSES } from '../utils/homeAccess';
import { HomeQuickAccess } from './HomeQuickAccess';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock };
};

const subtitles = buildHomeAccessSubtitles({
  animalCount: 48,
  expenseCount: 12,
  pendingCareTaskCount: 6,
});

describe('HomeQuickAccess (D36 / RFG-169, D38.1 / RFG-172)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the four destinations with their real subtitles', async () => {
    const screen = await render(<HomeQuickAccess accesses={HOME_ACCESSES} subtitles={subtitles} />);

    expect(screen.getByText('Animales')).toBeTruthy();
    expect(screen.getByText('48 registrados')).toBeTruthy();
    expect(screen.getByText('Cuidados')).toBeTruthy();
    expect(screen.getByText('6 pendientes')).toBeTruthy();
    expect(screen.getByText('Historia clínica')).toBeTruthy();
    expect(screen.getByText('Registros clínicos')).toBeTruthy();
    expect(screen.getByText('Gastos')).toBeTruthy();
    expect(screen.getByText('12 registros')).toBeTruthy();
  });

  it('renders nothing when no destination is authorized', async () => {
    const screen = await render(<HomeQuickAccess accesses={[]} subtitles={subtitles} />);

    expect(screen.queryByTestId('home-accesses')).toBeNull();
  });

  it('exposes an accessible button with the full label and subtitle', async () => {
    const screen = await render(<HomeQuickAccess accesses={HOME_ACCESSES} subtitles={subtitles} />);

    expect(screen.getByLabelText('Historia clínica. Registros clínicos')).toBeTruthy();
  });

  it('navigates to the real destination on press', async () => {
    const screen = await render(<HomeQuickAccess accesses={HOME_ACCESSES} subtitles={subtitles} />);

    await fireEvent.press(screen.getByTestId('home-access-expenses'));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/expenses' });
  });
});
