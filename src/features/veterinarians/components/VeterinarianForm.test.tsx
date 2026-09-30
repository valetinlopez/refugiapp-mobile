import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { VeterinarianForm } from './VeterinarianForm';

describe('VeterinarianForm', () => {
  it('submits trimmed required values and omitted optionals', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={onSubmit} submitLabel="Crear veterinario" />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), ' Sofía ');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), ' Romero ');
    await fireEvent.changeText(screen.getByLabelText('Matrícula'), ' VET-001 ');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear veterinario' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Sofía',
        lastName: 'Romero',
        licenseNumber: 'VET-001',
        email: undefined,
        phone: undefined,
        userId: undefined,
        notes: undefined,
      }),
      undefined
    );
  });

  it('submits an optional user id when valid', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={onSubmit} submitLabel="Crear veterinario" />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), 'Romero');
    await fireEvent.changeText(screen.getByLabelText('Matrícula'), 'VET-001');
    await fireEvent.changeText(
      screen.getByLabelText('ID de usuario vinculado (opcional)'),
      '22222222-2222-4222-8222-222222222222'
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Crear veterinario' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ userId: '22222222-2222-4222-8222-222222222222' }),
      undefined
    );
  });

  it('shows validation messages before submitting invalid data', async () => {
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={jest.fn()} submitLabel="Crear veterinario" />
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Crear veterinario' }));

    expect(await screen.findByText('Ingresá el nombre.')).toBeTruthy();
    expect(screen.getByText('Ingresá el apellido.')).toBeTruthy();
    expect(screen.getByText('Ingresá la matrícula.')).toBeTruthy();
  });

  it('rejects an invalid optional email and user id', async () => {
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={jest.fn()} submitLabel="Crear veterinario" />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), 'Romero');
    await fireEvent.changeText(screen.getByLabelText('Matrícula'), 'VET-001');
    await fireEvent.changeText(screen.getByLabelText('Email (opcional)'), 'invalid');
    await fireEvent.changeText(screen.getByLabelText('ID de usuario vinculado (opcional)'), 'x');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear veterinario' }));

    expect(await screen.findByText('Ingresá un email válido.')).toBeTruthy();
    expect(screen.getByText('Ingresá un ID de usuario válido.')).toBeTruthy();
  });

  it('announces a create error returned by the feature', async () => {
    const screen = await render(
      <VeterinarianForm
        errorMessage="Ya existe un veterinario con esa matrícula."
        isSubmitting={false}
        onSubmit={jest.fn()}
        submitLabel="Crear veterinario"
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ya existe un veterinario con esa matrícula.'
    );
  });
});
