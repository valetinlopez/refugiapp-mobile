import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AdopterForm } from './AdopterForm';

describe('AdopterForm', () => {
  it('validates contact data before submitting', async () => {
    const onSubmit = jest.fn();
    const screen = await render(<AdopterForm isSubmitting={false} onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Registrar postulación' }));

    expect(await screen.findByText('Ingresá el nombre.')).toBeTruthy();
    expect(screen.getByText('Ingresá el apellido.')).toBeTruthy();
    expect(screen.getByText('Ingresá un email válido.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('normalizes valid values and exposes the privacy notice', async () => {
    const onSubmit = jest.fn();
    const screen = await render(<AdopterForm isSubmitting={false} onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('Nombre del adoptante'), ' Ana ');
    await fireEvent.changeText(screen.getByLabelText('Apellido del adoptante'), ' Pérez ');
    await fireEvent.changeText(screen.getByLabelText('Email del adoptante'), ' ANA@EXAMPLE.COM ');
    await fireEvent.changeText(screen.getByLabelText('Teléfono del adoptante'), '+5491123456789');
    await fireEvent.press(screen.getByRole('button', { name: 'Registrar postulación' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Ana',
          lastName: 'Pérez',
          email: 'ana@example.com',
          phone: '+5491123456789',
        }),
        undefined
      )
    );
    expect(screen.getByText(/datos personales se usan únicamente/i)).toBeTruthy();
  });
});
