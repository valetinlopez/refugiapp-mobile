import { fireEvent, render } from '@testing-library/react-native';

import { AttachmentRow } from './AttachmentRow';

describe('AttachmentRow (RFG-136)', () => {
  it('shows a ready attachment and requests removal', async () => {
    const onRemove = jest.fn();
    const screen = await render(
      <AttachmentRow
        attachment={{ id: 'a1', name: 'radiografia.jpg', sizeLabel: '1,2 MB', status: 'ready' }}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('radiografia.jpg')).toBeTruthy();
    expect(screen.getByText('1,2 MB')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Quitar radiografia.jpg' }));
    expect(onRemove).toHaveBeenCalledWith('a1');
  });

  it('exposes upload progress to assistive technology', async () => {
    const screen = await render(
      <AttachmentRow
        attachment={{ id: 'a2', name: 'informe.pdf', progress: 0.45, status: 'uploading' }}
      />
    );

    expect(screen.getByText('45%')).toBeTruthy();
    expect(screen.getByLabelText('Progreso de subida de informe.pdf')).toHaveAccessibilityValue({
      max: 100,
      min: 0,
      now: 45,
    });
  });

  it('announces an upload error and retries', async () => {
    const onRetry = jest.fn();
    const screen = await render(
      <AttachmentRow
        attachment={{
          errorMessage: 'La subida falló.',
          id: 'a3',
          name: 'receta.pdf',
          status: 'error',
        }}
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('La subida falló.');

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar subida de receta.pdf' }));
    expect(onRetry).toHaveBeenCalledWith('a3');
  });
});
