import { fireEvent, render } from '@testing-library/react-native';

import { AnimalDetailTabs } from './AnimalDetailTabs';

describe('AnimalDetailTabs', () => {
  it('shows the clinical tab only when the capability is available', async () => {
    const screen = await render(
      <AnimalDetailTabs activeTab="summary" canReadClinicalRecords={false} onChange={jest.fn()} />
    );
    expect(screen.queryByRole('tab', { name: 'Evolución clínica' })).toBeNull();
    await screen.rerender(
      <AnimalDetailTabs activeTab="summary" canReadClinicalRecords onChange={jest.fn()} />
    );
    expect(screen.getByRole('tab', { name: 'Evolución clínica' })).toBeTruthy();
  });

  it('changes the active section without navigation', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <AnimalDetailTabs activeTab="summary" canReadClinicalRecords onChange={onChange} />
    );
    await fireEvent.press(screen.getByRole('tab', { name: 'Cuidados' }));
    expect(onChange).toHaveBeenCalledWith('tasks');
  });

  it('shows adoption to every authenticated role', async () => {
    const screen = await render(
      <AnimalDetailTabs activeTab="summary" canReadClinicalRecords={false} onChange={jest.fn()} />
    );
    expect(screen.getByRole('tab', { name: 'Adopción' })).toBeTruthy();
  });

  it('exposes a tab list and announces the selected section', async () => {
    const screen = await render(
      <AnimalDetailTabs activeTab="history" canReadClinicalRecords onChange={jest.fn()} />
    );

    expect(screen.getByLabelText('Secciones del animal')).toHaveProp(
      'accessibilityRole',
      'tablist'
    );
    expect(screen.getByTestId('animal-detail-tabs')).toHaveStyle({ overflow: 'hidden' });
    expect(screen.getByRole('tab', { name: 'Historial' })).toHaveProp('accessibilityState', {
      selected: true,
      disabled: false,
    });
    expect(screen.getByRole('tab', { name: 'Resumen' })).toHaveProp('accessibilityState', {
      selected: false,
      disabled: false,
    });
  });
});
