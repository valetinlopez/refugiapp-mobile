import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText } from '@/components/primitives';
import { colors, opacity, radii, sizes, spacing } from '@/theme';

import type { HomeAccess, HomeAccessId } from '../utils/homeAccess';

export interface HomeQuickAccessProps {
  accesses: readonly HomeAccess[];
  subtitles: Record<HomeAccessId, string>;
}

/**
 * "Accesos rápidos" for Inicio (D36 / RFG-169, D38.1 / RFG-172).
 *
 * A symmetric two-column grid of navigation cards to the real destinations
 * (Animales, Cuidados, Historia clínica, Gastos), already filtered by
 * capabilities by the caller. The cell uses a percentage basis with
 * `minWidth: 0`, so two columns always fit even at 320 pt (the previous fixed
 * `minWidth` pushed the label out of the viewport and clipped it). Cells stretch
 * to a shared row height and the inner card fills it, keeping the grid even.
 *
 * Each card keeps a 44 pt+ target, a colored circular icon plus text (so state
 * never relies on color) and a chevron affordance; labels truncate internally
 * without pushing the icon or the chevron.
 */
export function HomeQuickAccess({ accesses, subtitles }: HomeQuickAccessProps) {
  if (accesses.length === 0) return null;

  return (
    <View style={styles.grid} testID="home-accesses">
      {accesses.map((access) => {
        const subtitle = subtitles[access.id];
        return (
          <Pressable
            accessibilityLabel={`${access.label}. ${subtitle}`}
            accessibilityRole="button"
            key={access.id}
            onPress={() => router.push(access.href)}
            style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
            testID={`home-access-${access.id}`}
          >
            <AppCard style={styles.card} variant="elevated">
              <View style={[styles.icon, { backgroundColor: colors[access.tone] }]}>
                <AppIcon color="textInverse" name={access.icon} size={sizes.iconMd} />
              </View>
              <View style={styles.copy}>
                <AppText ellipsizeMode="tail" numberOfLines={1} variant="bodyStrong">
                  {access.label}
                </AppText>
                <AppText
                  color="textSecondary"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  variant="caption"
                >
                  {subtitle}
                </AppText>
              </View>
              <AppIcon color="textSecondary" name="chevronRight" />
            </AppCard>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
  },
  cell: {
    flexBasis: '46%',
    flexGrow: 1,
    minWidth: 0,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  grid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radii.full,
    flexShrink: 0,
    height: sizes.avatarSm,
    justifyContent: 'center',
    width: sizes.avatarSm,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
