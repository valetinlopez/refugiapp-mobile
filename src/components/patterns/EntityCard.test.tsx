import { fireEvent, render } from '@testing-library/react-native';

import { EntityCard } from './EntityCard';

describe('EntityCard (RFG-136)', () => {
  it('describes non-interactive content as a summary', async () => {
    const screen = await render(
      <EntityCard badge={{ label: 'En tratamiento' }} meta="Perra · Mestiza" title="Luna" />
    );

    expect(screen.getByLabelText('Luna, Perra · Mestiza, En tratamiento')).toBeTruthy();
  });

  it('becomes a single accessible button that fires onPress', async () => {
    const onPress = jest.fn();
    const screen = await render(<EntityCard onPress={onPress} title="Luna" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Luna' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps the full accessible label even when the title truncates', async () => {
    const screen = await render(
      <EntityCard
        accessibilityLabel="Luna, Perra mestiza de pelaje claro, En tratamiento"
        badge={{ label: 'En tratamiento' }}
        meta="Perra mestiza de pelaje claro"
        onPress={() => undefined}
        title="Luna"
      />
    );

    expect(
      screen.getByRole('button', { name: 'Luna, Perra mestiza de pelaje claro, En tratamiento' })
    ).toBeTruthy();
  });
});
