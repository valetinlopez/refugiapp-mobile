import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { VeterinarianForm } from './VeterinarianForm';

describe('VeterinarianForm', () => {
  it('submits trimmed required values without creating a user', async () => {
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
        shouldCreateUser: false,
        createUserEmail: undefined,
        createUserPassword: undefined,
        notes: undefined,
      }),
      undefined
    );
  });

  it('creates a user when the toggle is enabled with email and password', async () => {
    const onSubmit = jest.fn();
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={onSubmit} submitLabel="Crear veterinario" />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), 'Romero');
    await fireEvent.changeText(screen.getByLabelText('Matrícula'), 'VET-001');
    await fireEvent(screen.getByLabelText('Crear usuario de acceso'), 'valueChange', true);
    await fireEvent.changeText(screen.getByLabelText('Email del usuario'), 'vet@refugiapp.local');
    await fireEvent.changeText(screen.getByLabelText('Contraseña inicial'), 'Refugia-2026-secure');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear veterinario' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldCreateUser: true,
        createUserEmail: 'vet@refugiapp.local',
        createUserPassword: 'Refugia-2026-secure',
      }),
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

  it('rejects an invalid optional email', async () => {
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={jest.fn()} submitLabel="Crear veterinario" />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), 'Romero');
    await fireEvent.changeText(screen.getByLabelText('Matrícula'), 'VET-001');
    await fireEvent.changeText(screen.getByLabelText('Email (opcional)'), 'invalid');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear veterinario' }));

    expect(await screen.findByText('Ingresá un email válido.')).toBeTruthy();
  });

  it('rejects a short password when creating a user', async () => {
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={jest.fn()} submitLabel="Crear veterinario" />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), 'Romero');
    await fireEvent.changeText(screen.getByLabelText('Matrícula'), 'VET-001');
    await fireEvent(screen.getByLabelText('Crear usuario de acceso'), 'valueChange', true);
    await fireEvent.changeText(screen.getByLabelText('Contraseña inicial'), 'short');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear veterinario' }));

    expect(
      await screen.findByText('La contraseña debe tener al menos 12 caracteres.')
    ).toBeTruthy();
  });

  it('rejects creating a user without an email on either side', async () => {
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={jest.fn()} submitLabel="Crear veterinario" />
    );

    await fireEvent.changeText(screen.getByLabelText('Nombre'), 'Sofía');
    await fireEvent.changeText(screen.getByLabelText('Apellido'), 'Romero');
    await fireEvent.changeText(screen.getByLabelText('Matrícula'), 'VET-001');
    await fireEvent(screen.getByLabelText('Crear usuario de acceso'), 'valueChange', true);
    await fireEvent.changeText(screen.getByLabelText('Contraseña inicial'), 'Refugia-2026-secure');
    await fireEvent.press(screen.getByRole('button', { name: 'Crear veterinario' }));

    expect(
      await screen.findByText(
        'Ingresá el email del veterinario o del usuario para crear el acceso.'
      )
    ).toBeTruthy();
  });

  it('does not offer user creation in edit mode', async () => {
    const screen = await render(
      <VeterinarianForm
        isSubmitting={false}
        mode="edit"
        onSubmit={jest.fn()}
        submitLabel="Guardar cambios"
      />
    );

    expect(screen.queryByLabelText('Crear usuario de acceso')).toBeNull();
    expect(screen.queryByLabelText('Contraseña inicial')).toBeNull();
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
