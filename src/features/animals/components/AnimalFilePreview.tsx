import { Image } from 'expo-image';
import { useCallback } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import {
  AccessibilityInfo,
  Linking,
  Modal,
  PixelRatio,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { optimizeCloudinaryImageUrl } from '@/core/media';
import { colors, radii, sizes, spacing } from '@/theme';

import type { AnimalFile } from '../types';
import { getAnimalFileMeta, isSafeAnimalFileUrl } from '../utils/animalFilePresentation';

export interface AnimalFilePreviewProps {
  canDelete: boolean;
  deleting?: boolean;
  file: AnimalFile | null;
  onClose(): void;
  onRequestDelete(id: string): void;
  openExternal?: (file: AnimalFile) => void;
  visible: boolean;
}

function defaultOpenExternal(file: AnimalFile): void {
  if (!isSafeAnimalFileUrl(file.secureUrl)) {
    AccessibilityInfo.announceForAccessibility('No pudimos abrir el adjunto.');
    return;
  }
  Linking.openURL(file.secureUrl).catch(() => {
    AccessibilityInfo.announceForAccessibility('No pudimos abrir el adjunto.');
  });
}

/**
 * Fullscreen preview for an animal file (RFG-184 / MED-01).
 *
 * Images render with `expo-image` (`contain`, memory-disk cache, Cloudinary
 * optimized to physical pixels). PDFs and other documents show a glyph with
 * metadata and a safe external open (https only, failures announced in
 * Spanish). Deletion is never executed here: it only forwards to the owner's
 * `ConfirmDialog`. Respects reduce motion (`none` vs `fade`).
 */
export function AnimalFilePreview({
  canDelete,
  deleting = false,
  file,
  onClose,
  onRequestDelete,
  openExternal = defaultOpenExternal,
  visible,
}: AnimalFilePreviewProps) {
  const { height, width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const handleOpen = useCallback(() => {
    if (file !== null) openExternal(file);
  }, [file, openExternal]);

  const handleDelete = useCallback(() => {
    if (file !== null) onRequestDelete(file.id);
  }, [file, onRequestDelete]);

  const previewWidth = Math.round(Math.min(width, sizes.dialogMaxWidth) * PixelRatio.get());
  const previewHeight = Math.round(height * 0.6);
  const imageUri =
    file !== null && file.isImage
      ? optimizeCloudinaryImageUrl(file.secureUrl, { width: previewWidth })
      : null;

  return (
    <Modal
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View accessibilityViewIsModal style={styles.scrim} testID="animal-file-preview">
        <Pressable
          accessibilityLabel="Cerrar vista previa"
          accessibilityRole="button"
          hitSlop={sizes.hitSlop}
          onPress={onClose}
          style={styles.backdrop}
          testID="animal-file-preview-backdrop"
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <AppText numberOfLines={2} style={styles.title} variant="heading3">
              {file?.name ?? 'Vista previa'}
            </AppText>
            <AppButton
              accessibilityLabel="Cerrar vista previa"
              icon="close"
              label=""
              onPress={onClose}
              testID="animal-file-preview-close"
              variant="ghost"
            />
          </View>
          {file !== null && imageUri !== null ? (
            <View style={[styles.imageFrame, { height: previewHeight }]}>
              <Image
                accessibilityLabel={`Vista previa de ${file.name}`}
                allowDownscaling
                cachePolicy="memory-disk"
                contentFit="contain"
                recyclingKey={imageUri}
                source={{ uri: imageUri }}
                style={styles.image}
                testID="animal-file-preview-image"
              />
            </View>
          ) : file !== null ? (
            <View style={styles.document}>
              <AppIcon color="textSecondary" name="document" size={sizes.iconLg} />
              <AppText color="textSecondary" variant="caption">
                {getAnimalFileMeta(file)}
              </AppText>
              <AppText color="textSecondary" variant="caption">
                El adjunto se abre fuera de la app de forma segura.
              </AppText>
            </View>
          ) : null}
          <View style={styles.actions}>
            {file !== null && !file.isImage ? (
              <AppButton
                accessibilityLabel={`Abrir ${file.name} fuera de la app`}
                icon="document"
                label="Abrir adjunto"
                onPress={handleOpen}
                testID="animal-file-preview-open"
                variant="secondary"
              />
            ) : null}
            {file !== null && canDelete ? (
              <AppButton
                accessibilityLabel={`Eliminar ${file.name}`}
                disabled={deleting}
                icon="trash"
                label="Eliminar"
                loading={deleting}
                onPress={handleDelete}
                testID="animal-file-preview-delete"
                variant="danger"
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  backdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    gap: spacing.md,
    maxWidth: sizes.dialogMaxWidth,
    padding: spacing.lg,
    width: '100%',
  },
  document: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageFrame: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
    width: '100%',
  },
  scrim: {
    alignItems: 'center',
    backgroundColor: colors.scrim,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
});
