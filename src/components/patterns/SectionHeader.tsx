import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from '@/components/primitives';
import { spacing } from '@/theme';

export type SectionHeaderProps = ViewProps & {
  /** Optional trailing element (link, counter, small action). */
  action?: ReactNode;
  subtitle?: string | undefined;
  title: string;
};

/**
 * Shared section heading (D03 / RFG-136).
 *
 * Groups the sections inside a screen (detail, history, clinical evolution)
 * with a consistent `heading2` hierarchy. Extracted from the internal catalog
 * helper so every screen reuses the same semantics and spacing. The title is
 * exposed as a header; the optional action sits at the end of the row and
 * wraps with the title when space is tight.
 */
export function SectionHeader({ action, style, subtitle, title, ...props }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.copy}>
        <AppText accessibilityRole="header" variant="heading2">
          {title}
        </AppText>
        {subtitle ? (
          <AppText color="textSecondary" variant="caption">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
  },
  container: {
    alignItems: 'flex-end',
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
