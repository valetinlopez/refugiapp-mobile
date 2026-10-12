import { render } from '@testing-library/react-native';

import { TodaySummaryCard } from './TodaySummaryCard';

describe('TodaySummaryCard (D36 / RFG-169, D38.1 / RFG-172)', () => {
  it('renders the three real indicators', async () => {
    const screen = await render(
      <TodaySummaryCard animalCount={48} pendingCareTaskCount={6} underTreatmentCount={9} />
    );

    expect(screen.getByText('Animales')).toBeTruthy();
    expect(screen.getByText('48')).toBeTruthy();
    expect(screen.getByText('En tratamiento')).toBeTruthy();
    expect(screen.getByText('9')).toBeTruthy();
    expect(screen.getByText('Cuidados pendientes')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
  });

  it('renders a symmetric three-up layout with two vertical dividers', async () => {
    const screen = await render(
      <TodaySummaryCard animalCount={7} pendingCareTaskCount={4} underTreatmentCount={2} />
    );

    expect(screen.getAllByTestId('home-summary-divider')).toHaveLength(2);
  });

  it('exposes each metric as an accessible summary with its value', async () => {
    const screen = await render(
      <TodaySummaryCard animalCount={7} pendingCareTaskCount={4} underTreatmentCount={2} />
    );

    expect(screen.getByLabelText('Animales: 7')).toBeTruthy();
    expect(screen.getByLabelText('En tratamiento: 2')).toBeTruthy();
    expect(screen.getByLabelText('Cuidados pendientes: 4')).toBeTruthy();
  });

  it('degrades a missing care-task count to an em dash with a safe label', async () => {
    const screen = await render(
      <TodaySummaryCard animalCount={3} pendingCareTaskCount={undefined} underTreatmentCount={1} />
    );

    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByLabelText('Cuidados pendientes: sin datos')).toBeTruthy();
  });
});
