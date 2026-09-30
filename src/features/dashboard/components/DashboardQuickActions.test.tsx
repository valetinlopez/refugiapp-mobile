import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { QUICK_ACTIONS } from '../utils/quickActions';
import { DashboardQuickActions } from './DashboardQuickActions';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

const { router } = jest.requireMock('expo-router') as {
  router: { push: jest.Mock };
};

describe('DashboardQuickActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders every action as a button in the declared order', async () => {
    const screen = await render(<DashboardQuickActions actions={QUICK_ACTIONS} />);

    const labels = screen.getAllByRole('button').map((button) => button.props.accessibilityLabel);
    expect(labels).toEqual(['Alta animal', 'Nueva tarea', 'Registrar gasto', 'Gestionar usuarios']);
  });

  it('stacks the actions as a full-width column with a token gap', async () => {
    const screen = await render(<DashboardQuickActions actions={QUICK_ACTIONS} />);

    const container = screen.getByLabelText('Acciones rápidas');
    const flattened = StyleSheet.flatten(container.props.style) as {
      flexDirection: string;
      gap: number;
    };
    expect(flattened.flexDirection).toBe('column');
    expect(flattened.gap).toBe(12);
  });

  it('keeps a 44x44 minimum touch target on every action', async () => {
    const screen = await render(<DashboardQuickActions actions={QUICK_ACTIONS} />);

    for (const label of ['Alta animal', 'Nueva tarea', 'Registrar gasto', 'Gestionar usuarios']) {
      const button = screen.getByRole('button', { name: label });
      const flattened = StyleSheet.flatten(button.props.style) as {
        minHeight: number;
        minWidth: number;
      };
      expect(flattened.minHeight).toBeGreaterThanOrEqual(44);
      expect(flattened.minWidth).toBeGreaterThanOrEqual(44);
    }
  });

  it('navigates to the declared href on press', async () => {
    const screen = await render(<DashboardQuickActions actions={QUICK_ACTIONS} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Alta animal' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/animals/new' });
  });

  it('renders nothing when no action is authorized for the role', async () => {
    const screen = await render(<DashboardQuickActions actions={[]} />);

    expect(screen.queryByLabelText('Acciones rápidas')).toBeNull();
  });
});
