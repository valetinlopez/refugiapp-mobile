import { render } from '@testing-library/react-native';

import type { AnimalHistoryEvent } from '../types';
import { AnimalHistoryTimelineItem } from './AnimalHistoryTimelineItem';

const BASE_EVENT: AnimalHistoryEvent = {
  id: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
  animalId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  eventType: 'status_change',
  description: 'Status changed from available_for_adoption to adopted.',
  occurredAt: '2026-09-21T14:30:00.000Z',
  createdByUserId: null,
};

describe('AnimalHistoryTimelineItem', () => {
  it('renders the humanized status change with title, description and date hierarchy', async () => {
    const screen = await render(<AnimalHistoryTimelineItem event={BASE_EVENT} isFirst isLast />);

    expect(screen.getByText('Cambio de estado')).toBeTruthy();
    expect(screen.getByText('Cambió de Disponible para adopción a Adoptado')).toBeTruthy();
    expect(screen.queryByText(/available_for_adoption/)).toBeNull();
    expect(screen.queryByText(/_/)).toBeNull();
    expect(
      screen.getByLabelText(/Cambio de estado\. Cambió de Disponible para adopción a Adoptado/)
    ).toBeTruthy();
  });

  it('shows Sin valor for missing descriptions or dates', async () => {
    const screen = await render(
      <AnimalHistoryTimelineItem
        event={{ ...BASE_EVENT, description: '', occurredAt: 'not-a-date' }}
        isFirst
        isLast
      />
    );

    expect(screen.getAllByText('Sin valor')).toHaveLength(2);
  });

  it('keeps readable text when the system font is scaled to 200%', async () => {
    const screen = await render(
      <AnimalHistoryTimelineItem event={BASE_EVENT} isFirst={false} isLast={false} />
    );

    const description = screen.getByText('Cambió de Disponible para adopción a Adoptado');
    expect(description.props.allowFontScaling ?? true).not.toBe(false);
    expect(description.props.maxFontSizeMultiplier ?? 1.8).toBeGreaterThanOrEqual(1.8);
  });
});
