import { fireEvent, render } from '@testing-library/react-native';

import type { VeterinarianOption } from '../types';
import { VeterinarianRecordField } from './VeterinarianRecordField';

const VET: VeterinarianOption = {
  id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
  name: 'Sofía Romero',
  licenseNumber: 'VET-001',
};

describe('VeterinarianRecordField', () => {
  it('selects a veterinarian from the sheet', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <VeterinarianRecordField
        disabled={false}
        onChange={onChange}
        options={[VET]}
        status="ready"
        value=""
      />
    );

    await fireEvent.press(screen.getByTestId('clinical-veterinarian-field'));
    await fireEvent.press(screen.getByLabelText('Sofía Romero'));

    expect(onChange).toHaveBeenCalledWith(VET.id);
  });

  it('clears a selected veterinarian from the trigger', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <VeterinarianRecordField
        disabled={false}
        onChange={onChange}
        options={[VET]}
        status="ready"
        value={VET.id}
      />
    );

    await fireEvent.press(screen.getByTestId('clinical-veterinarian-clear'));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('offers the empty state with retry without blocking', async () => {
    const onRetry = jest.fn();
    const screen = await render(
      <VeterinarianRecordField
        disabled={false}
        onChange={() => undefined}
        onRetry={onRetry}
        options={[]}
        status="empty"
        value=""
      />
    );

    expect(screen.getByText('Sin veterinarios activos')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Reintentar'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
