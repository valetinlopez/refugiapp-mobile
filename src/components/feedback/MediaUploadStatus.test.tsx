import { fireEvent, render } from '@testing-library/react-native';

import { MediaUploadStatus } from './MediaUploadStatus';

describe('MediaUploadStatus', () => {
  it('announces progress and exposes it to assistive technology', async () => {
    const screen = await render(
      <MediaUploadStatus fileName="informe.pdf" progress={0.42} status="uploading" />
    );

    expect(screen.getByText('Subiendo informe.pdf')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
    expect(screen.getByLabelText('Progreso de subida')).toHaveAccessibilityValue({
      max: 100,
      min: 0,
      now: 42,
    });
  });

  it('cancels an active upload', async () => {
    const onCancel = jest.fn();
    const screen = await render(
      <MediaUploadStatus onCancel={onCancel} progress={0.2} status="uploading" />
    );

    fireEvent.press(screen.getByRole('button', { name: 'Cancelar subida' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows an upload error as an alert', async () => {
    const screen = await render(
      <MediaUploadStatus errorMessage="La subida falló." progress={0} status="error" />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('La subida falló.');
  });
});
