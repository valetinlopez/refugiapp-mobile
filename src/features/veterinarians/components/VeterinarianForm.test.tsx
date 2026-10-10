import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { sizes } from '@/theme';

import { VeterinarianForm } from './VeterinarianForm';

describe('VeterinarianForm', () => {
  it('keeps create controls flexible for narrow screens and 200 percent text', async () => {
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={jest.fn()} submitLabel="Crear veterinario" />
    );
    const actions = StyleSheet.flatten(screen.getByTestId('veterinarian-form-actions').props.style);
    const switchRow = StyleSheet.flatten(
      screen.getByTestId('veterinarian-create-user-row').props.style
    );

    expect(actions).toEqual(expect.objectContaining({ flexDirection: 'row', flexWrap: 'wrap' }));
    expect(switchRow).toEqual(
      expect.objectContaining({ alignItems: 'flex-start', minHeight: sizes.touchTarget })
    );
    expect(actions.height).toBeUndefined();
    expect(switchRow.height).toBeUndefined();
  });

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
    await fireEvent.changeText(
      screen.getByLabelText('Correo electrónico de acceso'),
      'vet@refugiapp.local'
    );
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

  it('uses the D29 sections without exposing the conceptual user selector', async () => {
    const screen = await render(
      <VeterinarianForm isSubmitting={false} onSubmit={jest.fn()} submitLabel="Crear perfil" />
    );

    expect(screen.getByRole('header', { name: 'Información profesional' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Acceso a Refugiapp' })).toBeTruthy();
    expect(screen.getByText('Rol Veterinario')).toBeTruthy();
    expect(screen.queryByText('Seleccionar usuario')).toBeNull();
  });

  it('shows license and access-email conflicts beside different fields', async () => {
    const initialValues = {
      firstName: 'Sofía',
      lastName: 'Romero',
      licenseNumber: 'VET-001',
      email: undefined,
      phone: undefined,
      notes: undefined,
      shouldCreateUser: true,
      createUserEmail: 'vet@refugiapp.local',
      createUserPassword: 'Refugia-2026-secure',
    };
    const screen = await render(
      <VeterinarianForm
        initialValues={initialValues}
        isSubmitting={false}
        onSubmit={jest.fn()}
        serverErrors={{
          createUserEmail: 'Ese correo ya está vinculado.',
          licenseNumber: 'Esa matrícula ya existe.',
        }}
        submitLabel="Crear perfil"
      />
    );

    expect(screen.getByLabelText('Matrícula').parent?.props).toBeTruthy();
    expect(screen.getByText('Esa matrícula ya existe.')).toBeTruthy();
    expect(screen.getByLabelText('Correo electrónico de acceso').parent?.props).toBeTruthy();
    expect(screen.getByText('Ese correo ya está vinculado.')).toBeTruthy();
  });

  it('offers a cancel action without submitting', async () => {
    const onCancel = jest.fn();
    const onSubmit = jest.fn();
    const screen = await render(
      <VeterinarianForm
        isSubmitting={false}
        onCancel={onCancel}
        onSubmit={onSubmit}
        submitLabel="Crear perfil"
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
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
