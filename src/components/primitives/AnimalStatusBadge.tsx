import { StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { colors, motion, radii, sizes } from '@/theme';
import type { AnimalStatus, BadgeTone } from '@/types/design-system';

import { AppBadge } from './AppBadge';
import { AppIcon, type AppIconName } from './AppIcon';

export type AnimalStatusBadgeVariant = 'compact' | 'full';

export type AnimalStatusBadgeProps = ViewProps & {
  status: AnimalStatus;
  variant?: AnimalStatusBadgeVariant | undefined;
};

export interface AnimalStatusPresentation {
  icon: AppIconName;
  label: string;
  tone: BadgeTone;
}

/**
 * Canonical `animal_status` presentation (D40 / RFG-176).
 *
 * Single source of truth for the icon, Spanish label and tone of each backend
 * status. Every icon is distinct, so the state never depends on color alone.
 * Labels match `docs/design.md` §27 and enums stay exactly as OpenAPI.
 */
const ANIMAL_STATUS_PRESENTATION: Record<AnimalStatus, AnimalStatusPresentation> = {
  admitted: { icon: 'info', label: 'Ingresado', tone: 'neutral' },
  under_treatment: { icon: 'medical', label: 'En tratamiento', tone: 'info' },
  available_for_adoption: { icon: 'heart', label: 'Disponible para adopción', tone: 'positive' },
  adopted: { icon: 'check', label: 'Adoptado', tone: 'positive' },
  deceased: { icon: 'paw', label: 'Fallecido', tone: 'neutral' },
};

export function getAnimalStatusPresentation(status: AnimalStatus): AnimalStatusPresentation {
  return ANIMAL_STATUS_PRESENTATION[status];
}

export function getAnimalStatusLabel(status: AnimalStatus): string {
  return ANIMAL_STATUS_PRESENTATION[status].label;
}

// Backgrounds mirror AppBadge tones so both variants share the same
// verified `textInverse`-over-tone contrast pairs.
const toneStyles: Record<BadgeTone, ViewStyle> = {
  positive: { backgroundColor: colors.positive },
  warning: { backgroundColor: colors.warning },
  danger: { backgroundColor: colors.danger },
  info: { backgroundColor: colors.info },
  neutral: { backgroundColor: colors.neutral },
  default: { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 },
};

/**
 * Shared animal status badge (D40 / RFG-176).
 *
 * - `full`: icon + text via `AppBadge`, for contexts with room (detail, grid).
 * - `compact`: icon-only circle for dense rows (`Animales recientes`), so long
 *   labels such as "Disponible para adopción" can never truncate or wrap. The
 *   screen reader still announces the full state via `Estado: <label>`.
 *
 * Appearance and status changes fade in with `motion.durationSubtle`
 * (opacity only, GPU-accelerated). With reduce motion enabled the badge
 * renders statically. The compact badge itself is not interactive; when it
 * lives inside a pressable row, the row owns the 44 pt target.
 */
export function AnimalStatusBadge({
  status,
  style,
  variant = 'full',
  ...props
}: AnimalStatusBadgeProps) {
  const presentation = ANIMAL_STATUS_PRESENTATION[status];
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion ? {} : { entering: FadeIn.duration(motion.durationSubtle) };

  if (variant === 'full') {
    return (
      <Animated.View key={status} {...motionProps}>
        <AppBadge
          icon={presentation.icon}
          label={presentation.label}
          style={style}
          tone={presentation.tone}
          {...props}
        />
      </Animated.View>
    );
  }

  const contentColor = presentation.tone === 'default' ? 'textPrimary' : 'textInverse';

  return (
    <Animated.View
      accessibilityLabel={`Estado: ${presentation.label}`}
      accessibilityRole="image"
      key={status}
      style={[styles.compact, toneStyles[presentation.tone], style]}
      {...motionProps}
      {...props}
    >
      <AppIcon color={contentColor} name={presentation.icon} size={sizes.iconSm} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  compact: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: sizes.avatarSm,
    justifyContent: 'center',
    width: sizes.avatarSm,
  },
});
