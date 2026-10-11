import type { ComponentProps } from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import type { AnimalOption } from '@/application/animals';
import type { HomePriority } from '@/application/home';

import { TodayPriorities } from './TodayPriorities';

jest.mock('@/application/animals', () => ({
  useAnimalOptionPhoto: jest.fn(() => ({ data: undefined })),
}));

const ANIMAL_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const OTHER_ANIMAL_ID = '7fa85f64-5717-4562-b3fc-2c963f66afa6';

function priority(overrides: Partial<HomePriority> = {}): HomePriority {
  return {
    animalId: ANIMAL_ID,
    dueAt: '2026-10-10T11:00:00-03:00',
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    state: 'upcoming',
    title: 'Control veterinario',
    ...overrides,
  };
}

const animalsById = new Map<string, AnimalOption>([[ANIMAL_ID, { id: ANIMAL_ID, name: 'Luna' }]]);

function buildProps(
  overrides: Partial<ComponentProps<typeof TodayPriorities>> = {}
): ComponentProps<typeof TodayPriorities> {
  return {
    animalsById,
    isError: false,
    isPending: false,
    onOpenAgenda: jest.fn(),
    onOpenPriority: jest.fn(),
    onRetry: jest.fn(),
    priorities: [priority()],
    ...overrides,
  };
}

describe('TodayPriorities (D36 / RFG-169)', () => {
  it('renders the resolved animal name and derived state, never a raw UUID', async () => {
    const screen = await render(<TodayPriorities {...buildProps()} />);

    expect(screen.getByText('Próxima')).toBeTruthy();
    expect(screen.getByText('Control veterinario')).toBeTruthy();
    expect(screen.getByText(/Luna/)).toBeTruthy();
    expect(screen.queryByText(ANIMAL_ID)).toBeNull();
  });

  it('falls back to a readable label when the animal is not in the loaded options', async () => {
    const screen = await render(
      <TodayPriorities {...buildProps({ priorities: [priority({ animalId: OTHER_ANIMAL_ID })] })} />
    );

    expect(screen.getByText(/Animal no disponible/)).toBeTruthy();
    expect(screen.queryByText(OTHER_ANIMAL_ID)).toBeNull();
  });

  it('opens the full agenda from the section action', async () => {
    const props = buildProps();
    const screen = await render(<TodayPriorities {...props} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Ver todos los cuidados' }));
    expect(props.onOpenAgenda).toHaveBeenCalled();
  });

  it('navigates to the task when a row is pressed', async () => {
    const props = buildProps();
    const screen = await render(<TodayPriorities {...props} />);

    await fireEvent.press(screen.getByTestId('home-priority-row'));
    expect(props.onOpenPriority).toHaveBeenCalledWith(
      expect.objectContaining({ animalId: ANIMAL_ID })
    );
  });

  it('shows a loading state while the page resolves', async () => {
    const screen = await render(
      <TodayPriorities {...buildProps({ isPending: true, priorities: [] })} />
    );

    expect(screen.getByText('Cargando prioridades')).toBeTruthy();
  });

  it('shows a retryable error state instead of an endless spinner', async () => {
    const props = buildProps({ isError: true, priorities: [] });
    const screen = await render(<TodayPriorities {...props} />);

    expect(screen.getByText('No pudimos cargar las prioridades.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar cargar prioridades' }));
    expect(props.onRetry).toHaveBeenCalled();
  });

  it('shows an empty state when there are no loaded pending tasks', async () => {
    const screen = await render(<TodayPriorities {...buildProps({ priorities: [] })} />);

    expect(screen.getByText('No hay cuidados pendientes para hoy.')).toBeTruthy();
  });
});
