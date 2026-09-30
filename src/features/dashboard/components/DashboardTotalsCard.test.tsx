import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import type { DashboardTotals } from '../types';
import { DashboardTotalsCard } from './DashboardTotalsCard';

const TOTALS: DashboardTotals = {
  animals: 7,
  byStatus: {
    admitted: 1,
    under_treatment: 3,
    available_for_adoption: 0,
    adopted: 2,
    deceased: 1,
  },
};

describe('DashboardTotalsCard', () => {
  it('renders the total and one accessible badge per animal status', async () => {
    const screen = await render(<DashboardTotalsCard totals={TOTALS} />);

    expect(screen.getByText('Animales activos')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByLabelText('Ingresado: 1')).toBeTruthy();
    expect(screen.getByLabelText('En tratamiento: 3')).toBeTruthy();
    expect(screen.getByLabelText('Disponible para adopción: 0')).toBeTruthy();
    expect(screen.getByLabelText('Adoptado: 2')).toBeTruthy();
    expect(screen.getByLabelText('Fallecido: 1')).toBeTruthy();
  });

  it('wraps the badges with token gaps and start alignment', async () => {
    const screen = await render(<DashboardTotalsCard totals={TOTALS} />);

    const firstBadge = screen.getByLabelText('Ingresado: 1');
    const container = firstBadge.parent;
    expect(container).not.toBeNull();

    const flattened = StyleSheet.flatten(container?.props.style) as {
      alignItems: string;
      columnGap: number;
      flexDirection: string;
      flexWrap: string;
      rowGap: number;
    };
    expect(flattened.flexDirection).toBe('row');
    expect(flattened.flexWrap).toBe('wrap');
    expect(flattened.alignItems).toBe('flex-start');
    expect(flattened.columnGap).toBe(8);
    expect(flattened.rowGap).toBe(8);
  });
});
