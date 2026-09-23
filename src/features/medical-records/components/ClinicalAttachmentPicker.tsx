import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { DOCUMENT_MEDIA_TYPES, validateMediaFile } from '@/core/media';
import { colors, radii, sizes, spacing } from '@/theme';

import type { AttachmentFile } from '../api/clinicalAttachmentsApi';
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
  const total = value.length + existing.length;

  function addFile(file: AttachmentFile): void {
    if (total >= MAX_MEDICAL_ATTACHMENTS) {
      setPickerError(`No podés adjuntar más de ${MAX_MEDICAL_ATTACHMENTS} archivos.`);
      return;
    }
    const validationError = validateMediaFile(file, DOCUMENT_MEDIA_TYPES);
    if (validationError === 'invalid_type') {
      setPickerError('Solo podés adjuntar imágenes JPEG, PNG o WebP y documentos PDF.');
      return;
    }
    if (validationError === 'file_too_large') {
      setPickerError('Un archivo supera los 10 MB. Elegí archivos más livianos.');
      return;
    }
    onChange([...value, file]);
  }

  async function handlePickImage(source: 'camera' | 'gallery'): Promise<void> {
    if (isPicking || disabled) return;
    setPickerError(null);
    setIsPicking(true);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPickerError(
          source === 'camera'
            ? 'Necesitamos acceso a la cámara para fotografiar el documento.'
            : 'Necesitamos acceso a tus fotos para adjuntar archivos.'
        );
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset === undefined) return;
      addFile({
        uri: asset.uri,
        name: asset.fileName ?? fileNameFromUri(asset.uri),
        mimeType: asset.mimeType ?? 'image/jpeg',
        ...(asset.fileSize != null ? { size: asset.fileSize } : {}),
        ...(asset.file !== undefined ? { file: asset.file } : {}),
      });
    } finally {
      setIsPicking(false);
    }
  }

  async function handlePickPdf(): Promise<void> {
    if (isPicking || disabled) return;
    setPickerError(null);
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: 'application/pdf',
      });
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset !== undefined) {
        addFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/pdf',
          ...(asset.size != null ? { size: asset.size } : {}),
          ...(asset.file !== undefined ? { file: asset.file } : {}),
        });
      }
    } finally {
      setIsPicking(false);
    }
  }

  const busy = isPicking || disabled;

  return (
    <View style={styles.container}>
      {total > 0 ? (
        <View accessibilityLabel="Adjuntos clínicos" style={styles.list}>
          {existing.map((file) => (
            <AttachmentRow
              disabled={disabled}
              key={file.id}
              name={file.name}
              onRemove={() => onRemoveExisting(file.id)}
            />
          ))}
          {value.map((file, index) => (
            <AttachmentRow
              disabled={disabled}
              key={`${file.uri}-${index}`}
              name={file.name}
              onRemove={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
            />
          ))}
        </View>
      ) : null}
      <View style={styles.actions}>
        <AppButton
          disabled={busy || total >= MAX_MEDICAL_ATTACHMENTS}
          label="Tomar foto"
          loading={isPicking}
          onPress={() => void handlePickImage('camera')}
          variant="secondary"
        />
        <AppButton
          disabled={busy || total >= MAX_MEDICAL_ATTACHMENTS}
          label="Elegir imagen"
          onPress={() => void handlePickImage('gallery')}
          variant="secondary"
        />
        <AppButton
          disabled={busy || total >= MAX_MEDICAL_ATTACHMENTS}
          label="Elegir PDF"
          onPress={() => void handlePickPdf()}
          variant="secondary"
        />
      </View>
      {pickerError ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {pickerError}
        </AppText>
      ) : null}
      <AppText color="textSecondary" variant="caption">
        Opcional. Hasta {MAX_MEDICAL_ATTACHMENTS} imágenes o PDF de 10 MB como máximo.
      </AppText>
    </View>
  );
}

function AttachmentRow({
  disabled,
  name,
  onRemove,
}: {
  disabled: boolean;
  name: string;
  onRemove(): void;
}) {
  return (
    <View style={styles.row}>
      <AppIcon color="textSecondary" name="medical" size={sizes.iconSm} />
      <AppText numberOfLines={1} style={styles.name}>
        {name}
      </AppText>
      <Pressable
        accessibilityLabel={`Quitar ${name}`}
        accessibilityRole="button"
        disabled={disabled}
        hitSlop={8}
        onPress={onRemove}
        style={styles.remove}
      >
        <AppIcon color="danger" name="close" size={sizes.iconSm} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  container: { gap: spacing.sm },
  list: { gap: spacing.xs },
  name: { flex: 1 },
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
