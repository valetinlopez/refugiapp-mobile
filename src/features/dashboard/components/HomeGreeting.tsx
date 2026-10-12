import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/primitives';
import { AccountMenuButton } from '@/features/auth/components/AccountMenuButton';
import { spacing } from '@/theme';

import { formatHomeDate, getSessionGreeting } from '../utils/greeting';

/**
 * Native editorial tagline rendered under the greeting on the Inicio hero
 * (D38.3 / RFG-174). It mirrors the reference copy and stays native text, never
 * text baked into the `hero-home` bitmap.
 */
export const HOME_HERO_TAGLINE = 'Mismo compromiso. Más vidas posibles.';

export interface HomeGreetingProps {
  firstName: string | null | undefined;
  /** Optional second line shown over the hero, e.g. `HOME_HERO_TAGLINE`. */
  caption?: string;
  /** Injectable for deterministic tests; defaults to the device clock. */
  now?: Date | undefined;
}

/**
 * Inicio greeting block (D36 / RFG-169, D38.3 / RFG-174): the single H1 of the
 * screen, the local `es-AR` date, an optional caption and the account shortcut.
 * Both the salutation and the date come from the session and the clock, so the
 * header never depends on bitmap text.
 */
export function HomeGreeting({ caption, firstName, now }: HomeGreetingProps) {
  return (
    <View style={styles.row} testID="home-greeting">
      <View style={styles.copy}>
        <AppText accessibilityRole="header" variant="heading1">
          {getSessionGreeting(firstName, now)}
        </AppText>
        <AppText color="textSecondary">{formatHomeDate(now)}</AppText>
        {caption ? <AppText variant="bodyStrong">{caption}</AppText> : null}
      </View>
      <AccountMenuButton />
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
});
