import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ApiError } from '@/core/api';

import type { VeterinarianResponse } from '../types';
import { VeterinarianDetail } from './VeterinarianDetail';

const VET: VeterinarianResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: '22222222-2222-4222-8222-222222222222',
  firstName: 'Sofía',
  lastName: 'Romero',
  licenseNumber: 'VET-001',
  email: 'sofia@refugiapp.local',
  phone: '+54 11 5555 0101',
  notes: 'Especialista en felinos.',
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

function detailQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: VET,
    error: null,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

function renderDetail(props: Partial<React.ComponentProps<typeof VeterinarianDetail>> = {}) {
  return render(
    <VeterinarianDetail
      canWrite
      confirmReactivateVisible={false}
      confirmVisible={false}
      deactivateError={null}
      onBack={jest.fn()}
      onCancelDeactivate={jest.fn()}
      onCancelReactivate={jest.fn()}
      onConfirmDeactivate={jest.fn()}
      onConfirmReactivate={jest.fn()}
      onEdit={jest.fn()}
      onRequestDeactivate={jest.fn()}
      onRequestReactivate={jest.fn()}
      onRetry={jest.fn()}
      query={detailQuery()}
      reactivateError={null}
      submittingDeactivate={false}
      submittingReactivate={false}
      {...props}
    />
  );
}

describe('VeterinarianDetail', () => {
  it('shows license number, state and contact data', async () => {
    const screen = await renderDetail();

    expect(screen.getByRole('header', { name: 'Perfil veterinario' })).toBeTruthy();
    expect(screen.getByText('Sofía Romero')).toBeTruthy();
    expect(screen.getByText('Matrícula VET-001')).toBeTruthy();
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(screen.getByText('sofia@refugiapp.local')).toBeTruthy();
    expect(screen.getByText('+54 11 5555 0101')).toBeTruthy();
    expect(screen.getByText('Especialista en felinos.')).toBeTruthy();
  });

  it('allows identity and linked-user cards to wrap with amplified text', async () => {
    const linked = {
      ...VET,
      user: {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'veterinaria-con-un-correo-extenso@refugiapp.local',
        firstName: 'Sofía Alejandra',
        lastName: 'Romero de los Andes',
        roles: ['veterinarian'],
        isActive: true,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
    } satisfies VeterinarianResponse;
    const screen = await renderDetail({ query: detailQuery({ data: linked }) });
    const identityStyle = StyleSheet.flatten(
      screen.getByTestId('veterinarian-identity-card').props.style
    );
    const userStyle = StyleSheet.flatten(screen.getByTestId('veterinarian-user-card').props.style);

    expect(identityStyle.flexWrap).toBe('wrap');
    expect(userStyle.flexWrap).toBe('wrap');
    expect(identityStyle.height).toBeUndefined();
    expect(userStyle.height).toBeUndefined();
    expect(screen.getByText('veterinaria-con-un-correo-extenso@refugiapp.local')).toBeTruthy();
  });

  it('shows fallback text for missing optional fields', async () => {
    const withoutOptionals = { ...VET, email: null, phone: null, notes: null, userId: null };
    const screen = await renderDetail({ query: detailQuery({ data: withoutOptionals }) });

    expect(screen.getAllByText('No informado')).toHaveLength(2);
    expect(screen.getByText('Sin acceso vinculado')).toBeTruthy();
    expect(screen.getByText('Sin notas')).toBeTruthy();
  });

  it('shows the linked user identity, email, role and state instead of a raw uuid', async () => {
    const linked = {
      ...VET,
      user: {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'vet-user@refugiapp.local',
        firstName: 'Sofía',
        lastName: 'Romero',
        roles: ['veterinarian'],
        isActive: true,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
    };
    const screen = await renderDetail({ query: detailQuery({ data: linked }) });

    expect(screen.getAllByText('Sofía Romero')).toHaveLength(2);
    expect(screen.getByText('vet-user@refugiapp.local')).toBeTruthy();
    expect(screen.getByText('Veterinario')).toBeTruthy();
    expect(screen.getByText('Cuenta activa')).toBeTruthy();
    expect(screen.queryByText('22222222-2222-4222-8222-222222222222')).toBeNull();
  });

  it('offers edit and deactivate actions with write permission', async () => {
    const onEdit = jest.fn();
    const onRequestDeactivate = jest.fn();
    const screen = await renderDetail({ onEdit, onRequestDeactivate });

    await fireEvent.press(screen.getByRole('button', { name: 'Editar perfil' }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Desactivar veterinario' }));
    expect(onRequestDeactivate).toHaveBeenCalledTimes(1);
  });

  it('confirms before deactivating', async () => {
    const onConfirmDeactivate = jest.fn();
    const onCancelDeactivate = jest.fn();
    const screen = await renderDetail({
      confirmVisible: true,
      onCancelDeactivate,
      onConfirmDeactivate,
    });

    expect(screen.getByText('Desactivar veterinario')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Desactivar' }));
    await waitFor(() => expect(onConfirmDeactivate).toHaveBeenCalledTimes(1));

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelDeactivate).toHaveBeenCalledTimes(1);
  });

  it('keeps the deactivate dialog visible while submitting', async () => {
    const screen = await renderDetail({
      confirmVisible: true,
      submittingDeactivate: true,
    });

    expect(screen.getByText('Desactivar veterinario')).toBeTruthy();
  });

  it('does not offer write actions without permission', async () => {
    const screen = await renderDetail({ canWrite: false });

    expect(screen.queryByRole('button', { name: 'Editar perfil' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Desactivar veterinario' })).toBeNull();
    expect(
      screen.getByText(/Tu rol permite consultar veterinarios, pero no editarlos/)
    ).toBeTruthy();
  });

  it('offers a reactivation action for inactive veterinarians with write permission', async () => {
    const inactive = { ...VET, isActive: false };
    const onRequestReactivate = jest.fn();
    const screen = await renderDetail({
      onRequestReactivate,
      query: detailQuery({ data: inactive }),
    });

    const reactivate = screen.getByRole('button', { name: 'Reactivar veterinario' });
    expect(reactivate.props.accessibilityState.disabled).toBeFalsy();
    expect(reactivate.props.accessibilityHint).toContain('reactivación');

    await fireEvent.press(reactivate);
    expect(onRequestReactivate).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        'El historial clínico asociado se conserva mientras el perfil está inactivo.'
      )
    ).toBeTruthy();
  });

  it('does not offer deactivate or reactivate actions without write permission', async () => {
    const inactive = { ...VET, isActive: false };
    const screen = await renderDetail({ canWrite: false, query: detailQuery({ data: inactive }) });

    expect(screen.queryByRole('button', { name: 'Reactivar veterinario' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Desactivar veterinario' })).toBeNull();
    expect(
      screen.getByText(/Tu rol permite consultar veterinarios, pero no editarlos/)
    ).toBeTruthy();
  });

  it('confirms before reactivating', async () => {
    const onConfirmReactivate = jest.fn();
    const onCancelReactivate = jest.fn();
    const screen = await renderDetail({
      confirmReactivateVisible: true,
      onCancelReactivate,
      onConfirmReactivate,
    });

    expect(screen.getByText('Reactivar veterinario')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar reactivación' }));
    await waitFor(() => expect(onConfirmReactivate).toHaveBeenCalledTimes(1));

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelReactivate).toHaveBeenCalledTimes(1);
  });

  it('keeps the reactivate dialog visible while submitting', async () => {
    const screen = await renderDetail({
      confirmReactivateVisible: true,
      submittingReactivate: true,
    });

    expect(screen.getByText('Reactivar veterinario')).toBeTruthy();
  });

  it('translates a reactivation conflict error inside the dialog', async () => {
    const screen = await renderDetail({
      confirmReactivateVisible: true,
      reactivateError: 'Este veterinario ya está activo.',
    });

    expect(screen.getByText('Este veterinario ya está activo.')).toBeTruthy();
  });

  it('translates a deactivation error inside the dialog', async () => {
    const screen = await renderDetail({
      confirmVisible: true,
      deactivateError: 'Tu rol no tiene permiso para gestionar veterinarios.',
    });

    expect(screen.getByText('Tu rol no tiene permiso para gestionar veterinarios.')).toBeTruthy();
  });

  it('renders an error state with retry when the query fails', async () => {
    const onRetry = jest.fn();
    const screen = await renderDetail({
      query: detailQuery({
        data: undefined,
        error: new ApiError({
          code: 'NOT_FOUND',
          message: 'Not found',
          requestId: 'request-id',
          status: 404,
        }),
        isError: true,
      }),
      onRetry,
    });

    expect(screen.getByText('El veterinario ya no está disponible.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders an empty state when the veterinarian does not exist', async () => {
    const onBack = jest.fn();
    const screen = await renderDetail({ query: detailQuery({ data: undefined }), onBack });

    expect(screen.getByText('Veterinario no encontrado')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
