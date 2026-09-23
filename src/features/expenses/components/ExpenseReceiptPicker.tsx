import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { DOCUMENT_MEDIA_TYPES, validateMediaFile } from '@/core/media';
import { colors, radii, sizes, spacing } from '@/theme';

import type { ReceiptFile } from '../types';

export function ExpenseReceiptPicker({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange(value: ReceiptFile | null): void;
  value: ReceiptFile | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  function accept(file: ReceiptFile): void {
    const validationError = validateMediaFile(file, DOCUMENT_MEDIA_TYPES);
    if (validationError === 'invalid_type') setError('Elegí una imagen JPEG, PNG, WebP o un PDF.');
    else if (validationError === 'file_too_large')
      setError('El comprobante no puede superar los 10 MB.');
    else {
      setError(null);
      onChange(file);
    }
  }

  async function pickImage(source: 'camera' | 'gallery'): Promise<void> {
    if (disabled || isPicking) return;
    setIsPicking(true);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Necesitamos permiso para acceder al comprobante.');
        return;
      }
      const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 } as const;
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset) {
        accept({
          uri: asset.uri,
          name: asset.fileName ?? `comprobante-${String(Date.now())}.jpg`,
          mimeType: asset.mimeType ?? 'image/jpeg',
          ...(asset.fileSize != null ? { size: asset.fileSize } : {}),
          ...(asset.file !== undefined ? { file: asset.file } : {}),
        });
      }
    } finally {
      setIsPicking(false);
    }
  }

  async function pickPdf(): Promise<void> {
    if (disabled || isPicking) return;
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: 'application/pdf',
      });
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset) {
        accept({
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

  return (
    <View style={styles.container}>
      <AppText variant="label">Comprobante</AppText>
      {value ? (
        <View accessibilityLabel={`Comprobante: ${value.name}`} style={styles.file}>
          <AppIcon color="textSecondary" name="medical" size={sizes.iconSm} />
          <AppText numberOfLines={1} style={styles.name}>
            {value.name}
          </AppText>
          <Pressable
            accessibilityLabel="Quitar comprobante"
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => onChange(null)}
            style={styles.remove}
          >
            <AppIcon color="danger" name="close" size={sizes.iconSm} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.actions}>
        <AppButton
          disabled={disabled || isPicking}
          label="Tomar foto"
          onPress={() => void pickImage('camera')}
          variant="secondary"
        />
        <AppButton
          disabled={disabled || isPicking}
          label="Elegir imagen"
          onPress={() => void pickImage('gallery')}
          variant="secondary"
        />
        <AppButton
          disabled={disabled || isPicking}
          label="Elegir PDF"
          onPress={() => void pickPdf()}
          variant="secondary"
        />
      </View>
      {error ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {error}
        </AppText>
      ) : null}
      <AppText color="textSecondary" variant="caption">
        Obligatorio. Imagen o PDF de hasta 10 MB.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  container: { gap: spacing.sm },
  file: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  name: { flex: 1 },
  remove: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
  },
});
