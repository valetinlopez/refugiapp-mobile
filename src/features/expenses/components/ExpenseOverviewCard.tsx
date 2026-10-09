import { Pressable, StyleSheet, View } from 'react-native';

import { AppAvatar, AppCard, AppIcon, AppText } from '@/components/primitives';
import { opacity, sizes, spacing } from '@/theme';

import type { Expense } from '../types';
import {
  formatAmountCents,
  formatExpenseDate,
  getExpenseCategoryLabel,
} from '../utils/expensePresentation';

export interface ExpenseOverviewCardProps {
  animalName: string;
  expense: Expense;
  onPress?: ((id: string) => void) | undefined;
}

/**
 * Global expense row.
 *
 * The animal name is resolved best-effort from the shared animals cache and
 * always falls back to an explicit label, never a raw UUID. The monetary value
 * comes formatted in ARS from integer cents; no floating point arithmetic.
 * Becomes a single accessible button when `onPress` opens the detail.
 */
export function ExpenseOverviewCard({ animalName, expense, onPress }: ExpenseOverviewCardProps) {
  const categoryLabel = getExpenseCategoryLabel(expense.category);
  const amount = formatAmountCents(expense.amountCents);
  const date = formatExpenseDate(expense.incurredAt);
  const accessibilityLabel = `${expense.description}, ${animalName}, ${categoryLabel}, ${amount}, ${date}`;

  const card = (
    <AppCard style={styles.card} variant="elevated">
      <AppAvatar accessibilityLabel={`Animal: ${animalName}`} initials={animalName} size="md" />
      <View style={styles.content}>
        <AppText numberOfLines={2} variant="bodyStrong">
          {expense.description}
        </AppText>
        <AppText color="textSecondary" numberOfLines={1} variant="label">
          {categoryLabel}
        </AppText>
        <View style={styles.animalRow}>
          <AppIcon color="textSecondary" name="account" size={sizes.iconSm} />
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {animalName}
          </AppText>
        </View>
      </View>
      <View style={styles.trailing}>
        <AppText numberOfLines={1} variant="heading3">
          {amount}
        </AppText>
        <AppText color="textSecondary" numberOfLines={1} variant="caption">
          {date}
        </AppText>
      </View>
    </AppCard>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityHint="Abre el detalle del gasto"
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={() => onPress(expense.id)}
        style={({ pressed }) => pressed && styles.pressed}
        testID="expense-overview-card"
      >
        {card}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
      testID="expense-overview-card"
    >
      {card}
    </View>
  );
}

const styles = StyleSheet.create({
  animalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  pressed: { opacity: opacity.pressed },
  trailing: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: spacing.xxs,
    maxWidth: '45%',
  },
});
