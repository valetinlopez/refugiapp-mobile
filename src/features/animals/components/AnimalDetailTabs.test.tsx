import { fireEvent, render } from '@testing-library/react-native';

import { AnimalDetailTabs } from './AnimalDetailTabs';

describe('AnimalDetailTabs', () => {
  it('shows the clinical tab only when the capability is available', async () => {
    const screen = await render(
      <AnimalDetailTabs activeTab="summary" canReadClinicalRecords={false} onChange={jest.fn()} />
    );
    expect(screen.queryByRole('button', { name: 'Evolución clínica' })).toBeNull();
    await screen.rerender(
      <AnimalDetailTabs activeTab="summary" canReadClinicalRecords onChange={jest.fn()} />
    );
    expect(screen.getByRole('button', { name: 'Evolución clínica' })).toBeTruthy();
  });

  it('changes the active section without navigation', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <AnimalDetailTabs activeTab="summary" canReadClinicalRecords onChange={onChange} />
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Tareas' }));
    expect(onChange).toHaveBeenCalledWith('tasks');
  });
});
