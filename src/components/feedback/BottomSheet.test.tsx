import { fireEvent, render } from '@testing-library/react-native';

import { AppText } from '@/components/primitives';

import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('renders the title and children when visible', async () => {
    const screen = await render(
      <BottomSheet onClose={jest.fn()} title="Cambiar estado" visible>
        <AppText>Contenido</AppText>
      </BottomSheet>
    );

    expect(screen.getByText('Cambiar estado')).toBeTruthy();
    expect(screen.getByText('Contenido')).toBeTruthy();
    expect(screen.getByTestId('bottom-sheet')).toBeTruthy();
  });

  it('exposes the title as a header', async () => {
    const screen = await render(
      <BottomSheet onClose={jest.fn()} title="Cambiar estado" visible>
        <AppText>Contenido</AppText>
      </BottomSheet>
    );

    expect(screen.getByRole('header', { name: 'Cambiar estado' })).toBeTruthy();
  });

  it('closes from the backdrop', async () => {
    const onClose = jest.fn();
    const screen = await render(
      <BottomSheet onClose={onClose} title="Cambiar estado" visible>
        <AppText>Contenido</AppText>
      </BottomSheet>
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when not visible', async () => {
    const screen = await render(
      <BottomSheet onClose={jest.fn()} title="Cambiar estado" visible={false}>
        <AppText>Contenido</AppText>
      </BottomSheet>
    );

    expect(screen.queryByText('Contenido')).toBeNull();
  });
});
