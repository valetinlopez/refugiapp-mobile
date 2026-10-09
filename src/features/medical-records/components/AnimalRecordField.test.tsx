import { fireEvent, render } from '@testing-library/react-native';

import type { AnimalOption } from '@/application/animals';

import { AnimalRecordField } from './AnimalRecordField';

jest.mock('@/application/animals', () => ({ useAnimalOptionPhoto: () => ({ data: undefined }) }));

const LUNA: AnimalOption = { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Luna' };
const APOLO: AnimalOption = { id: '7fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Apolo' };

describe('AnimalRecordField', () => {
  it('selects an animal through the searchable sheet', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <AnimalRecordField animals={[LUNA, APOLO]} disabled={false} onChange={onChange} value="" />
    );

    await fireEvent.press(screen.getByTestId('clinical-animal-field'));
    await fireEvent.changeText(screen.getByLabelText('Buscar animal por nombre'), 'apo');
    await fireEvent.press(screen.getByLabelText('Apolo'));

    expect(onChange).toHaveBeenCalledWith(APOLO.id);
  });

  it('reports when no animal matches the search', async () => {
    const screen = await render(
      <AnimalRecordField animals={[LUNA]} disabled={false} onChange={() => undefined} value="" />
    );

    await fireEvent.press(screen.getByTestId('clinical-animal-field'));
    await fireEvent.changeText(screen.getByLabelText('Buscar animal por nombre'), 'zzz');

    expect(screen.getByText(/No hay animales que coincidan/)).toBeTruthy();
  });

  it('shows the selected animal on the trigger', async () => {
    const screen = await render(
      <AnimalRecordField
        animals={[LUNA]}
        disabled={false}
        onChange={() => undefined}
        value={LUNA.id}
      />
    );

    expect(screen.getByText('Luna')).toBeTruthy();
  });
});
