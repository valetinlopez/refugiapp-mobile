import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppAvatar, AppIcon, AppText } from '@/components/primitives';
import { opacity, sizes, spacing } from '@/theme';

import { formatHomeDate, getSessionGreeting } from '../utils/greeting';

/**
 * Native editorial tagline rendered under the greeting on the Inicio hero
 * (D38.3 / RFG-174). It mirrors the reference copy and stays native text, never
 * text baked into the `hero-home` bitmap.
 */
export const HOME_HERO_TAGLINE = 'Mismo compromiso. Más vidas posibles.';

export interface HomeGreetingProps {
  firstName: string | null | undefined;
  lastName?: string | null | undefined;
  /** Optional second line shown over the hero, e.g. `HOME_HERO_TAGLINE`. */
  caption?: string;
  /** Injectable for deterministic tests; defaults to the device clock. */
  now?: Date | undefined;
}

function getHeaderInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const initials = [firstName, lastName].map((part) => (part ?? '').trim().charAt(0)).join('');
  return initials === '' ? '?' : initials;
}

/**
 * Inicio greeting block (D36 / RFG-169, D38.3 / RFG-174, D39.1 / RFG-175): the
 * single H1 of the screen, the local `es-AR` date, an optional caption and the
 * header shortcuts anchored to the right margin.
 *
 * Both the salutation and the date come from the session and the clock, so the
 * header never depends on bitmap text. The copy keeps `flex: 1` + `minWidth: 0`
 * while the actions stay `flexShrink: 0`, so "Perfil" and "Notificaciones" never
 * wrap below the greeting on 320 pt nor leave the reference margin. The session
 * publishes no photo, so the profile shortcut shows initials, never a
 * fictitious picture. Notifications live in "Más", so the bell navigates there
 * without inventing routes or endpoints.
 */
export function HomeGreeting({ caption, firstName, lastName, now }: HomeGreetingProps) {
  const initials = getHeaderInitials(firstName, lastName);

  return (
    <View style={styles.row} testID="home-greeting">
      <View style={styles.copy}>
        <AppText accessibilityRole="header" variant="heading1">
          {getSessionGreeting(firstName, now)}
        </AppText>
        <AppText color="textSecondary">{formatHomeDate(now)}</AppText>
        {caption ? <AppText variant="bodyStrong">{caption}</AppText> : null}
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityHint="Abre tu perfil"
          accessibilityLabel="Abrir perfil"
          accessibilityRole="button"
          hitSlop={sizes.hitSlop}
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          testID="home-action-profile"
        >
          <AppAvatar
            accessibilityLabel={`Foto de perfil de ${firstName ?? 'usuario'}`}
            initials={initials}
            size="sm"
          />
        </Pressable>
        <Pressable
          accessibilityHint="Abre Más con notificaciones"
          accessibilityLabel="Abrir notificaciones"
          accessibilityRole="button"
          hitSlop={sizes.hitSlop}
          onPress={() => router.push('/more')}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          testID="home-action-notifications"
        >
          <AppIcon color="textPrimary" name="notification" size={sizes.iconMd} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.xs,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
});
