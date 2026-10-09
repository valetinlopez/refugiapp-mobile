import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppIcon, AppText } from '@/components/primitives';
import { optimizeCloudinaryImageUrl } from '@/core/media';
import { colors, radii, sizes, spacing } from '@/theme';

import type { ExpenseReceipt } from '../types';
import { getReceiptFileName, getReceiptMetaLabel, isSafeReceiptUrl } from '../utils/expenseReceipt';

export type ExpenseReceiptCardState =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; receipt: ExpenseReceipt };

export interface ExpenseReceiptCardProps {
  errorMessage?: string | null;
  onOpen(): void;
  onRetry(): void;
  opening?: boolean;
  state: ExpenseReceiptCardState;
}

/**
 * Receipt section of the expense detail (D24 / RFG-157).
 *
 * Presents the optional `ticketMediaId` best-effort from `GET /media/:id`:
 * image thumbnail or document glyph, a file name derived from `format` and a
 * `resource · size` line. Opening delegates to the parent (validated URL); the
 * contract does not publish the original file name, so none is invented.
 */
export function ExpenseReceiptCard({
  errorMessage,
  onOpen,
  onRetry,
  opening = false,
  state,
}: ExpenseReceiptCardProps) {
  if (state.status === 'loading') {
    return (
      <AppCard variant="outlined">
        <AppText accessibilityLiveRegion="polite" color="textSecondary">
          Cargando comprobante…
        </AppText>
      </AppCard>
    );
  }

  if (state.status === 'empty') {
    return (
      <AppCard variant="outlined">
        <AppText color="textSecondary">Este gasto no tiene un comprobante adjunto.</AppText>
      </AppCard>
    );
  }

  if (state.status === 'error') {
    return (
      <AppCard variant="outlined">
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {state.message}
        </AppText>
        <AppButton label="Reintentar" onPress={onRetry} variant="secondary" />
      </AppCard>
    );
  }

  const { receipt } = state;
  const fileName = getReceiptFileName(receipt);
  const meta = getReceiptMetaLabel(receipt);
  const canPreview = receipt.resourceType === 'image' && isSafeReceiptUrl(receipt.secureUrl);
  const thumbnailUri = canPreview
    ? optimizeCloudinaryImageUrl(receipt.secureUrl, { width: 120 })
    : undefined;

  return (
    <AppCard style={styles.card} variant="outlined">
      <View style={styles.row}>
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.preview}
        >
          {thumbnailUri ? (
            <Image
              allowDownscaling
              cachePolicy="memory-disk"
              contentFit="cover"
              source={{ uri: thumbnailUri }}
              style={styles.image}
            />
          ) : (
            <AppIcon color="textSecondary" name="document" size={sizes.iconMd} />
          )}
        </View>
        <View style={styles.copy}>
          <AppText numberOfLines={1} variant="bodyStrong">
            {fileName}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {meta}
          </AppText>
        </View>
      </View>
      <AppButton
        icon="document"
        label="Ver archivo"
        loading={opening}
        onPress={onOpen}
        testID="expense-receipt-open"
        variant="secondary"
      />
      {errorMessage ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {errorMessage}
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  copy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  image: { height: '100%', width: '100%' },
  preview: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexShrink: 0,
    height: sizes.touchTarget,
    justifyContent: 'center',
    overflow: 'hidden',
    width: sizes.touchTarget,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
});
