import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';
import type { TypographyVariant } from '@/theme/typography';

export type ScreenHeaderTitleVariant = Extract<
  TypographyVariant,
  'display' | 'heading1' | 'heading2'
>;

export type ScreenHeaderProps = ViewProps & {
  /** Trailing actions (buttons, menu). Wraps below the title on narrow screens. */
  actions?: ReactNode;
  subtitle?: string | undefined;
  title: string;
  titleVariant?: ScreenHeaderTitleVariant;
};

/**
 * Shared screen title block (D03 / RFG-136).
 *
 * Renders the single top-level heading of a screen with its optional subtitle
 * and trailing actions. The title carries `accessibilityRole="header"` so the
 * document outline stays semantic on native platforms and on the web export.
 * The row wraps, so a long title or amplified font never clips the actions.
 */
export function ScreenHeader({
  actions,
  style,
  subtitle,
  title,
  titleVariant = 'heading1',
  ...props
}: ScreenHeaderProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.copy}>
        <AppText accessibilityRole="header" variant={titleVariant}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText color="textSecondary" variant="body">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
});
