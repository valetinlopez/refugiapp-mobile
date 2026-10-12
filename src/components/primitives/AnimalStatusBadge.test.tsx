import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { motion, sizes } from '@/theme';
import type { AnimalStatus } from '@/types/design-system';

import {
  AnimalStatusBadge,
  getAnimalStatusLabel,
  getAnimalStatusPresentation,
} from './AnimalStatusBadge';

const mockUseReducedMotion = useReducedMotion as unknown as jest.Mock;
const mockFadeInDuration = FadeIn.duration as unknown as jest.Mock;

const CASES: { label: string; status: AnimalStatus }[] = [
  { label: 'Ingresado', status: 'admitted' },
  { label: 'En tratamiento', status: 'under_treatment' },
  { label: 'Disponible para adopción', status: 'available_for_adoption' },
  { label: 'Adoptado', status: 'adopted' },
  { label: 'Fallecido', status: 'deceased' },
];

describe('AnimalStatusBadge (D40 / RFG-176)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseReducedMotion.mockReturnValue(false);
  });

  it.each(CASES)('full variant shows icon and text for $status', async ({ label, status }) => {
    const screen = await render(<AnimalStatusBadge status={status} variant="full" />);

    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByLabelText(label)).toBeTruthy();
  });

  it.each(CASES)(
    'compact variant announces the full state without rendering text for $status',
    async ({ label, status }) => {
      const screen = await render(<AnimalStatusBadge status={status} variant="compact" />);

      expect(screen.getByLabelText(`Estado: ${label}`)).toBeTruthy();
      expect(screen.queryByText(label)).toBeNull();
    }
  );

  it('maps every animal_status to its token presentation', () => {
    expect(getAnimalStatusPresentation('available_for_adoption')).toEqual({
      icon: 'heart',
      label: 'Disponible para adopción',
      tone: 'positive',
    });
    expect(getAnimalStatusLabel('deceased')).toBe('Fallecido');
  });

  it('uses a distinct icon per status so the state never depends on color alone', () => {
    const icons = CASES.map(({ status }) => getAnimalStatusPresentation(status).icon);

    expect(new Set(icons).size).toBe(CASES.length);
  });

  it('sizes the compact badge from theme tokens', async () => {
    const screen = await render(<AnimalStatusBadge status="under_treatment" variant="compact" />);

    const badge = screen.getByLabelText('Estado: En tratamiento');
    expect(StyleSheet.flatten(badge.props.style)).toMatchObject({
      height: sizes.avatarSm,
      width: sizes.avatarSm,
    });
  });

  it('announces the new state when the status changes', async () => {
    const screen = await render(<AnimalStatusBadge status="admitted" variant="compact" />);
    expect(screen.getByLabelText('Estado: Ingresado')).toBeTruthy();

    await screen.rerender(<AnimalStatusBadge status="adopted" variant="compact" />);

    expect(screen.getByLabelText('Estado: Adoptado')).toBeTruthy();
    expect(screen.queryByLabelText('Estado: Ingresado')).toBeNull();
  });

  it('animates appearance with the subtle motion token', async () => {
    await render(<AnimalStatusBadge status="admitted" variant="compact" />);

    expect(mockFadeInDuration).toHaveBeenCalledWith(motion.durationSubtle);
  });

  it('renders statically with reduce motion enabled', async () => {
    mockUseReducedMotion.mockReturnValue(true);

    const screen = await render(<AnimalStatusBadge status="admitted" variant="compact" />);

    expect(mockFadeInDuration).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Estado: Ingresado')).toBeTruthy();
  });
});
