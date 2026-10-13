import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sizes, spacing } from '@/theme';

/**
 * Bottom offset owned by the absolute `CurvedTabBar`.
 *
 * The bar is positioned absolute over the scene with
 * `totalHeight = bottomNavigationCurve + bottomNavigationHeight + insets.bottom`.
 * Tab screens keep `SafeAreaView edges={['top','left','right']}` so the bar is
 * the sole owner of the bottom inset; scrollable content must reserve the same
 * height plus a breathing margin, always from `src/theme` tokens.
 */
export function resolveTabBarContentPaddingBottom(
  insetsBottom: number,
  extra: number = spacing.lg
): number {
  return sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + insetsBottom + extra;
}

/**
 * Hook version of {@link resolveTabBarContentPaddingBottom}.
 *
 * @param extra trailing margin after the bar, from `src/theme` (defaults to
 * `spacing.lg`; lists with a FAB pass `sizes.fab + spacing.*`).
 */
export function useTabBarContentPadding(extra: number = spacing.lg): number {
  const insets = useSafeAreaInsets();
  return resolveTabBarContentPaddingBottom(insets.bottom, extra);
}
