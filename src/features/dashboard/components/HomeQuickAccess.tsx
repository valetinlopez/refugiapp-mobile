import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppIcon, AppText } from '@/components/primitives';
import { opacity, spacing } from '@/theme';

import type { HomeAccess, HomeAccessId } from '../utils/homeAccess';

export interface HomeQuickAccessProps {
  accesses: readonly HomeAccess[];
  subtitles: Record<HomeAccessId, string>;
}

/**
 * "Accesos rápidos" for Inicio (D36 / RFG-169).
 *
 * A responsive two-column grid of navigation cards to the real destinations
 * (Animales, Cuidados, Historia clínica, Gastos), already filtered by
 * capabilities by the caller. Each card keeps a 44 pt+ target, an icon plus text
 * (so state never relies on color) and a chevron affordance. The grid collapses
 * to a single column when the viewport or the amplified font no longer fits two.
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
              <View style={styles.iconWrap}>
                <AppIcon color="positive" name={access.icon} size={22} />
              </View>
              <View style={styles.copy}>
                <AppText numberOfLines={2} variant="bodyStrong">
                  {access.label}
                </AppText>
                <AppText color="textSecondary" numberOfLines={2} variant="caption">
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
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
  },
  cell: {
    flexBasis: '46%',
    flexGrow: 1,
    minWidth: 148,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
