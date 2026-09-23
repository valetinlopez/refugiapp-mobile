import { fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { DateTimeField } from './DateTimeField';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({ onChange }: { onChange(event: { type: string }, date?: Date): void }) =>
    React.createElement(
      Pressable,
      {
        accessibilityLabel: 'picker nativo',
        onPress: () => onChange({ type: 'set' }, new Date(2026, 0, 10, 12)),
      },
      React.createElement(Text, null, 'picker')
    );
  return { __esModule: true, default: MockPicker };
});

describe('DateTimeField', () => {
  it('opens the native picker and serializes a calendar date', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'ios');
    const onChange = jest.fn();
    const screen = await render(
      <DateTimeField
        accessibilityLabel="Fecha de ingreso"
        mode="date"
        onChange={onChange}
        value=""
      />
    );
    await fireEvent.press(screen.getByLabelText('Elegir fecha de ingreso'));
    await fireEvent.press(screen.getByLabelText('picker nativo'));
    expect(onChange).toHaveBeenCalledWith('2026-01-10');
    platform.restore();
  });

  it('uses an accessible text fallback on web', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web');
    const onChange = jest.fn();
    const screen = await render(
      <DateTimeField
        accessibilityLabel="Fecha de ingreso"
        mode="date"
        onChange={onChange}
        value=""
      />
    );
    await fireEvent.changeText(screen.getByLabelText('Fecha de ingreso'), '2026-01-10');
    expect(onChange).toHaveBeenCalledWith('2026-01-10');
    platform.restore();
  });
});
