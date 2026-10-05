import { act, fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

import { RESEND_COOLDOWN_SECONDS, useResendCooldown } from './useResendCooldown';

function CooldownHarness() {
  const { remaining, start } = useResendCooldown();
  const [label, setLabel] = useState('start');

  return (
    <View>
      <Text testID="remaining">{remaining}</Text>
      <Button
        onPress={() => {
          start();
          setLabel('started');
        }}
        title={label}
      />
    </View>
  );
}

describe('useResendCooldown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts idle with no remaining time', async () => {
    const screen = await render(<CooldownHarness />);

    expect(screen.getByTestId('remaining')).toHaveTextContent('0');
  });

  it('counts down from the cooldown after start and re-enables', async () => {
    const screen = await render(<CooldownHarness />);

    await fireEvent.press(screen.getByRole('button', { name: 'start' }));

    expect(screen.getByTestId('remaining')).toHaveTextContent(String(RESEND_COOLDOWN_SECONDS));

    await act(async () => {
      jest.advanceTimersByTime(RESEND_COOLDOWN_SECONDS * 1000);
    });

    expect(screen.getByTestId('remaining')).toHaveTextContent('0');
  });

  it('restarts the countdown on repeated starts', async () => {
    const screen = await render(<CooldownHarness />);
    const startButton = screen.getByRole('button', { name: 'start' });

    await fireEvent.press(startButton);
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId('remaining')).toHaveTextContent(String(RESEND_COOLDOWN_SECONDS - 10));

    await fireEvent.press(startButton);
    expect(screen.getByTestId('remaining')).toHaveTextContent(String(RESEND_COOLDOWN_SECONDS));
  });
});
