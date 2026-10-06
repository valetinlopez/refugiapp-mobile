import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

export type AttachmentStatus = 'ready' | 'uploading' | 'error';

export interface AttachmentItem {
  errorMessage?: string | undefined;
  id: string;
  name: string;
  /** Upload progress in the 0..1 range; only meaningful while uploading. */
  progress?: number | undefined;
  /** Pre-formatted size (e.g. "1,2 MB"). Formatting stays in the feature. */
  sizeLabel?: string | undefined;
  status: AttachmentStatus;
  /** Preview URI for image attachments; a document glyph is shown otherwise. */
  thumbnailUri?: string | undefined;
}

export interface AttachmentRowProps {
  attachment: AttachmentItem;
  onRemove?: ((id: string) => void) | undefined;
  onRetry?: ((id: string) => void) | undefined;
  removeDisabled?: boolean | undefined;
  testID?: string | undefined;
}

function progressPercentage(progress: number | undefined): number {
  if (progress === undefined) return 0;
  return Math.round(Math.max(0, Math.min(1, progress)) * 100);
}

/**
 * Shared attachment row (D03 / RFG-136).
 *
 * One attachment with its preview/glyph, name, size and lifecycle state:
 * `ready` shows the file, `uploading` shows an accessible progress bar and
 * percentage, `error` shows a safe message with a retry action. Removal is
 * requested through `onRemove`; the confirmation dialog is owned by
 * `AttachmentList`. The preview is decorative because the file name already
 * identifies the attachment.
 */
export function AttachmentRow({
  attachment,
  onRemove,
  onRetry,
  removeDisabled = false,
  testID,
}: AttachmentRowProps) {
  const percentage = progressPercentage(attachment.progress);
  const isUploading = attachment.status === 'uploading';
  const isError = attachment.status === 'error';

  return (
    <View style={styles.container} testID={testID}>
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.preview}
      >
        {attachment.thumbnailUri ? (
          <Image
            allowDownscaling
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: attachment.thumbnailUri }}
            style={styles.image}
          />
        ) : (
          <AppIcon color="textSecondary" name="document" size={sizes.iconMd} />
        )}
      </View>

      <View style={styles.body}>
        <AppText numberOfLines={1} variant="bodyStrong">
          {attachment.name}
        </AppText>
        {attachment.sizeLabel ? (
          <AppText color="textSecondary" variant="caption">
            {attachment.sizeLabel}
          </AppText>
        ) : null}
        {isUploading ? (
          <View style={styles.progressBlock}>
            <View
              accessibilityLabel={`Progreso de subida de ${attachment.name}`}
              accessibilityRole="progressbar"
              accessibilityValue={{ max: 100, min: 0, now: percentage }}
              style={styles.track}
            >
              <View style={[styles.fill, { width: `${percentage}%` }]} />
            </View>
            <AppText color="textSecondary" variant="caption">
              {percentage}%
            </AppText>
          </View>
        ) : null}
        {isError ? (
          <AppText
            accessibilityLiveRegion="assertive"
            color="danger"
            role="alert"
            variant="caption"
          >
            {attachment.errorMessage ?? 'No pudimos subir el archivo.'}
          </AppText>
        ) : null}
      </View>

      <View style={styles.actions}>
        {isError && onRetry ? (
          <AppButton
            accessibilityLabel={`Reintentar subida de ${attachment.name}`}
            icon="refresh"
            label="Reintentar"
            onPress={() => onRetry(attachment.id)}
            variant="ghost"
          />
        ) : null}
        {onRemove ? (
          <AppButton
            accessibilityLabel={`Quitar ${attachment.name}`}
            disabled={removeDisabled}
            icon="close"
            label="Quitar"
            onPress={() => onRemove(attachment.id)}
            variant="ghost"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  fill: {
    backgroundColor: colors.info,
    borderRadius: radii.full,
    height: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
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
  progressBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  track: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    flex: 1,
    height: sizes.divider * 8,
    overflow: 'hidden',
  },
});
