import { fireEvent, render } from '@testing-library/react-native';

import { SegmentedControl, type SegmentedControlOption } from './SegmentedControl';

type Value = 'all' | 'pending';

const options: readonly SegmentedControlOption<Value>[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
];

describe('SegmentedControl (RFG-136)', () => {
  it('exposes a radiogroup with radio options and checked selection', async () => {
    const screen = await render(
      <SegmentedControl
        accessibilityLabel="Filtrar tareas por estado"
        onChange={() => undefined}
        options={options}
        value="all"
      />
    );

    const group = screen.getByLabelText('Filtrar tareas por estado');
    expect(group.props.accessibilityRole).toBe('radiogroup');
    expect(screen.getByRole('radio', { name: 'Todas' }).props.accessibilityState).toMatchObject({
      checked: true,
    });
    expect(
      screen.getByRole('radio', { name: 'Pendientes' }).props.accessibilityState
    ).toMatchObject({ checked: false });
  });

  it('reports the selected value when an option is pressed', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <SegmentedControl onChange={onChange} options={options} value="all" />
    );

    await fireEvent.press(screen.getByRole('radio', { name: 'Pendientes' }));

    expect(onChange).toHaveBeenCalledWith('pending');
  });

  it('disables an option and exposes it to assistive technology', async () => {
    const screen = await render(
      <SegmentedControl
        onChange={() => undefined}
        options={[{ disabled: true, id: 'pending', label: 'Pendientes' }, ...options.slice(0, 1)]}
        value="all"
      />
    );

    expect(
      screen.getByRole('radio', { name: 'Pendientes' }).props.accessibilityState
    ).toMatchObject({ disabled: true });
  });
});
