import { fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { DateTimeField } from './DateTimeField';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockPicker = ({
    onDismiss,
    onValueChange,
    ...props
  }: {
    onDismiss?(): void;
    onValueChange(
      event: { nativeEvent: { timestamp: number; utcOffset: number } },
      date: Date
    ): void;
    minimumDate?: Date;
    maximumDate?: Date;
    mode?: string;
    value?: Date;
  }) =>
    React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Pressable,
        {
          ...props,
          accessibilityLabel: 'picker nativo',
          onPress: () =>
            onValueChange(
              { nativeEvent: { timestamp: 0, utcOffset: 0 } },
              new Date(2026, 0, 10, 12)
            ),
        },
        React.createElement(Text, null, 'picker')
      ),
      React.createElement(
        Pressable,
        { accessibilityLabel: 'picker descartar', onPress: () => onDismiss?.() },
        React.createElement(Text, null, 'descartar')
      )
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

  it('forwards minimum and maximum bounds to the native picker', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'ios');
    const onChange = jest.fn();
    const minimumDate = new Date(2026, 0, 10);
    const maximumDate = new Date(2026, 11, 31);
    const screen = await render(
      <DateTimeField
        accessibilityLabel="Fecha de ingreso"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        mode="date"
        onChange={onChange}
        value=""
      />
    );
    await fireEvent.press(screen.getByLabelText('Elegir fecha de ingreso'));
    const picker = screen.getByLabelText('picker nativo');
    expect(picker.props.minimumDate).toEqual(minimumDate);
    expect(picker.props.maximumDate).toEqual(maximumDate);
    platform.restore();
  });

  it('serializes a local HH:mm time with time mode', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'ios');
    const onChange = jest.fn();
    const screen = await render(
      <DateTimeField accessibilityLabel="Hora de inicio" mode="time" onChange={onChange} value="" />
    );
    await fireEvent.press(screen.getByLabelText('Elegir hora de inicio'));
    await fireEvent.press(screen.getByLabelText('picker nativo'));
    expect(onChange).toHaveBeenCalledWith('12:00');
    platform.restore();
  });

  it('accepts a HH:mm text fallback on web', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web');
    const onChange = jest.fn();
    const screen = await render(
      <DateTimeField accessibilityLabel="Hora de inicio" mode="time" onChange={onChange} value="" />
    );
    await fireEvent.changeText(screen.getByLabelText('Hora de inicio'), '08:30');
    expect(onChange).toHaveBeenCalledWith('08:30');
    platform.restore();
  });

  it('serializes a local ISO datetime on iOS with datetime mode', async () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'ios');
    const onChange = jest.fn();
    const screen = await render(
      <DateTimeField
        accessibilityLabel="Fecha y hora"
        mode="datetime"
        onChange={onChange}
        value=""
      />
    );
    await fireEvent.press(screen.getByLabelText('Elegir fecha y hora'));
    await fireEvent.press(screen.getByLabelText('picker nativo'));
    expect(onChange).toHaveBeenCalledWith(
      expect.stringMatching(/^2026-01-10T12:00:00[+-]\d{2}:\d{2}$/)
    );
    platform.restore();
  });

  it('closes the picker on dismiss without emitting a value', async () => {
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
    await fireEvent.press(screen.getByLabelText('picker descartar'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('picker nativo')).toBeNull();
    platform.restore();
  });
});
