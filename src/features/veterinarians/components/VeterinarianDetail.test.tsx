import { fireEvent, render, waitFor } from '@testing-library/react-native';

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
      confirmVisible={false}
      deactivateError={null}
      onBack={jest.fn()}
      onCancelDeactivate={jest.fn()}
      onConfirmDeactivate={jest.fn()}
      onEdit={jest.fn()}
      onRequestDeactivate={jest.fn()}
      onRetry={jest.fn()}
      query={detailQuery()}
      submittingDeactivate={false}
      {...props}
    />
  );
}

describe('VeterinarianDetail', () => {
  it('shows license number, state and contact data', async () => {
    const screen = await renderDetail();

    expect(screen.getByText('Sofía Romero')).toBeTruthy();
    expect(screen.getByText('Matrícula VET-001')).toBeTruthy();
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(screen.getByText('sofia@refugiapp.local')).toBeTruthy();
    expect(screen.getByText('+54 11 5555 0101')).toBeTruthy();
    expect(screen.getByText('Especialista en felinos.')).toBeTruthy();
  });

  it('shows fallback text for missing optional fields', async () => {
    const withoutOptionals = { ...VET, email: null, phone: null, notes: null, userId: null };
    const screen = await renderDetail({ query: detailQuery({ data: withoutOptionals }) });

    expect(screen.getAllByText('No informado')).toHaveLength(2);
    expect(screen.getByText('Sin acceso vinculado')).toBeTruthy();
    expect(screen.getByText('Sin notas')).toBeTruthy();
  });

  it('shows the linked user email and role instead of a raw uuid', async () => {
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

    expect(screen.getByText('vet-user@refugiapp.local')).toBeTruthy();
    expect(screen.getByText('Veterinario')).toBeTruthy();
  });

  it('offers edit and deactivate actions with write permission', async () => {
    const onEdit = jest.fn();
    const onRequestDeactivate = jest.fn();
    const screen = await renderDetail({ onEdit, onRequestDeactivate });

    await fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
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

    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Desactivar veterinario' })).toBeNull();
    expect(
      screen.getByText(/Tu rol permite consultar veterinarios, pero no editarlos/)
    ).toBeTruthy();
  });

  it('shows a disabled reactivation button with a hint for inactive veterinarians', async () => {
    const inactive = { ...VET, isActive: false };
    const screen = await renderDetail({ query: detailQuery({ data: inactive }) });

    const reactivate = screen.getByRole('button', { name: 'Reactivar' });
    expect(reactivate.props.accessibilityState.disabled).toBe(true);
    expect(reactivate.props.accessibilityHint).toContain('pendiente');
    expect(screen.getByText(/La reactivación estará disponible/)).toBeTruthy();
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
