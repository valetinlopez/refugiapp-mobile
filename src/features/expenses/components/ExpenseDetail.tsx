import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AnimalOption } from '@/application/animals';
import { ConfirmDialog } from '@/components/feedback';
import { formatDateTime, MetadataRow, SectionHeader } from '@/components/patterns';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppDivider,
  AppIcon,
  AppText,
} from '@/components/primitives';
import { opacity, radii, spacing } from '@/theme';

import type { ExpenseDetail as ExpenseDetailModel } from '../types';
import { formatAmountCents, getExpenseCategoryLabel } from '../utils/expensePresentation';
import { ExpenseAnimalAvatar } from './ExpenseAnimalAvatar';
import { ExpenseReceiptCard, type ExpenseReceiptCardState } from './ExpenseReceiptCard';

export interface ExpenseDetailProps {
  animal?: AnimalOption | undefined;
  canWrite: boolean;
  deleteError?: string | null;
  expense: ExpenseDetailModel;
  isDeleting?: boolean;
  onDelete(): void;
  onOpenAnimal(animalId: string): void;
  onOpenReceipt(): void;
  onRetryReceipt(): void;
  receiptError?: string | null;
  receiptOpening?: boolean;
  receiptState: ExpenseReceiptCardState;
  registeredBy?: string | null;
}

/**
 * Presentational body of the expense detail (D24 / RFG-157).
 *
 * Pure: it receives the expense, the resolved animal/receipt and the
 * capabilities, and never fetches. Money is formatted from integer
 * `amountCents`; the actor line only appears when a safe label exists (never a
 * raw UUID) and the destructive action is gated by `canWrite` and confirmation.
 */
export function ExpenseDetail({
  animal,
  canWrite,
  deleteError,
  expense,
  isDeleting = false,
  onDelete,
  onOpenAnimal,
  onOpenReceipt,
  onRetryReceipt,
  receiptError,
  receiptOpening = false,
  receiptState,
  registeredBy,
}: ExpenseDetailProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const amount = formatAmountCents(expense.amountCents);
  const categoryLabel = getExpenseCategoryLabel(expense.category);
  const animalDetails = animal
    ? [animal.species, animal.breed].filter((value): value is string => Boolean(value)).join(' · ')
    : '';

  function confirmDelete(): void {
    onDelete();
    setConfirmVisible(false);
  }

  return (
    <View style={styles.container}>
      <AppCard
        accessibilityLabel={`${expense.description}, ${categoryLabel}, ${amount}`}
        accessibilityRole="summary"
        style={styles.heroCard}
        testID="expense-detail-summary"
        variant="elevated"
      >
        <AppText variant="display">{amount}</AppText>
        <View style={styles.badges}>
          <AppBadge icon="money" label={categoryLabel} tone="default" />
          <AppBadge label={expense.currency} tone="neutral" />
        </View>
        <AppText color="textSecondary">{expense.description}</AppText>
      </AppCard>

      <AppCard style={styles.sectionCard} variant="elevated">
        <SectionHeader title="Datos del gasto" />
        <MetadataRow label="Descripción" value={expense.description} />
        <AppDivider />
        <MetadataRow label="Fecha del gasto" value={formatDateTime(expense.incurredAt)} />
        <AppDivider />
        <MetadataRow label="Fecha de registro" value={formatDateTime(expense.createdAt)} />
        {registeredBy ? (
          <>
            <AppDivider />
            <MetadataRow label="Registrado por" value={registeredBy} />
          </>
        ) : null}
      </AppCard>

      {animal ? (
        <Pressable
          accessibilityHint="Abre la ficha del animal"
          accessibilityLabel={`Animal: ${animal.name}${animalDetails ? `, ${animalDetails}` : ''}. Ver ficha`}
          accessibilityRole="button"
          onPress={() => onOpenAnimal(animal.id)}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <AppCard style={styles.sectionCard} variant="elevated">
            <SectionHeader title="Animal" />
            <View style={styles.animalRow}>
              <ExpenseAnimalAvatar
                name={animal.name}
                profilePhotoMediaId={animal.profilePhotoMediaId}
                size="lg"
              />
              <View style={styles.animalCopy}>
                <AppText variant="heading2">{animal.name}</AppText>
                {animalDetails ? <AppText color="textSecondary">{animalDetails}</AppText> : null}
              </View>
              <View style={styles.animalAction}>
                <AppIcon color="textSecondary" name="chevronRight" />
                <AppText color="textSecondary" variant="caption">
                  Ver ficha
                </AppText>
              </View>
            </View>
          </AppCard>
        </Pressable>
      ) : (
        <AppCard style={styles.sectionCard} variant="elevated">
          <SectionHeader title="Animal" />
          <AppText color="textSecondary">No pudimos resolver el animal de este gasto.</AppText>
        </AppCard>
      )}

      <View style={styles.section}>
        <SectionHeader title="Comprobante" />
        <ExpenseReceiptCard
          {...(receiptError !== undefined ? { errorMessage: receiptError } : {})}
          onOpen={onOpenReceipt}
          onRetry={onRetryReceipt}
          opening={receiptOpening}
          state={receiptState}
        />
      </View>

      {deleteError ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {deleteError}
        </AppText>
      ) : null}

      {canWrite ? (
        <View style={styles.actions}>
          <AppButton
            disabled={isDeleting}
            icon="trash"
            label="Eliminar gasto"
            onPress={() => setConfirmVisible(true)}
            testID="expense-delete"
            variant="danger"
          />
          <AppText color="textSecondary" variant="caption">
            Se solicitará confirmación antes de eliminar el gasto.
          </AppText>
        </View>
      ) : (
        <AppText color="textSecondary">
          Tu rol permite consultar este gasto, pero no eliminarlo.
        </AppText>
      )}

      <ConfirmDialog
        confirmLabel="Eliminar gasto"
        confirming={isDeleting}
        consequence="El gasto se dará de baja y dejará de aparecer en los listados y en el total del dashboard."
        {...(deleteError ? { errorMessage: deleteError } : {})}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmDelete}
        title="¿Querés eliminar este gasto?"
        variant="danger"
        visible={confirmVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.xs },
  animalAction: { alignItems: 'center', flexShrink: 0, gap: spacing.xxs },
  animalCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  animalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  container: { gap: spacing.md },
  heroCard: { borderRadius: radii.xl, gap: spacing.md },
  pressed: { opacity: opacity.pressed },
  section: { gap: spacing.sm },
  sectionCard: { gap: spacing.md },
});
