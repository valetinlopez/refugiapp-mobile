import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { colors, radii, sizes, spacing } from '@/theme';

import { MAX_CLINICAL_ATTACHMENT_BYTES, type AttachmentFile } from '../api/clinicalAttachmentsApi';
import { MAX_MEDICAL_ATTACHMENTS } from '../utils/medicalRecordSchema';

interface ClinicalAttachmentPickerProps {
  disabled?: boolean;
  existing?: { id: string; name: string; secureUrl: string }[];
  onChange(files: AttachmentFile[]): void;
  onRemoveExisting(id: string): void;
  value: AttachmentFile[];
}

function fileNameFromUri(uri: string): string {
  const lastSegment = uri.split('/').pop() ?? '';
  const withoutQuery = lastSegment.split('?')[0] ?? '';
  return withoutQuery !== '' ? withoutQuery : `attachment-${String(Date.now())}.jpg`;
}

export function ClinicalAttachmentPicker({
  disabled = false,
  existing = [],
  onChange,
  onRemoveExisting,
  value,
}: ClinicalAttachmentPickerProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);

  async function handlePickFile(): Promise<void> {
    if (isPicking || disabled) {
      return;
    }
    setPickerError(null);
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPickerError('Necesitamos acceso a tus fotos para adjuntar archivos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (asset === undefined) {
        return;
      }

      if (value.length >= MAX_MEDICAL_ATTACHMENTS) {
        setPickerError(`No podés adjuntar más de ${MAX_MEDICAL_ATTACHMENTS} archivos.`);
        return;
      }
      if (asset.fileSize != null && asset.fileSize > MAX_CLINICAL_ATTACHMENT_BYTES) {
        setPickerError('Un archivo supera los 10 MB. Elige archivos más livianos.');
        return;
      }

      onChange([
        ...value,
        {
          uri: asset.uri,
          name: fileNameFromUri(asset.uri),
          mimeType: asset.mimeType ?? 'image/jpeg',
          ...(asset.fileSize != null ? { size: asset.fileSize } : {}),
        },
      ]);
    } finally {
      setIsPicking(false);
    }
  }

  const total = value.length + existing.length;
  const busy = isPicking || disabled;

  return (
    <View style={styles.container}>
      {existing.length > 0 || value.length > 0 ? (
        <View accessibilityLabel="Adjuntos clínicos" style={styles.list}>
          {existing.map((file) => (
            <View key={file.id} style={styles.row}>
              <AppIcon color="textSecondary" name="medical" size={sizes.iconSm} />
              <AppText numberOfLines={1} style={styles.name}>
                {file.name}
              </AppText>
              <Pressable
                accessibilityLabel={`Quitar ${file.name}`}
                accessibilityRole="button"
                disabled={disabled}
                hitSlop={8}
                onPress={() => onRemoveExisting(file.id)}
                style={styles.remove}
              >
                <AppIcon color="danger" name="close" size={sizes.iconSm} />
              </Pressable>
            </View>
          ))}
          {value.map((file, index) => (
            <View key={`${file.uri}-${index}`} style={styles.row}>
              <AppIcon color="textSecondary" name="medical" size={sizes.iconSm} />
              <AppText numberOfLines={1} style={styles.name}>
                {file.name}
              </AppText>
              <Pressable
                accessibilityLabel={`Quitar ${file.name}`}
                accessibilityRole="button"
                disabled={disabled}
                hitSlop={8}
                onPress={() => onChange(value.filter((_, i) => i !== index))}
                style={styles.remove}
              >
                <AppIcon color="danger" name="close" size={sizes.iconSm} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <AppButton
        disabled={busy || total >= MAX_MEDICAL_ATTACHMENTS}
        label={total === 0 ? 'Adjuntar archivo' : 'Adjuntar otro archivo'}
        loading={isPicking}
        onPress={() => void handlePickFile()}
        variant="secondary"
      />
      {pickerError ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {pickerError}
        </AppText>
      ) : null}
      <AppText color="textSecondary" variant="caption">
        Opcional. Hasta {MAX_MEDICAL_ATTACHMENTS} archivos de imágenes de 10 MB como máximo.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.xs,
  },
  name: {
    flex: 1,
  },
  remove: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
