import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppAvatar, AppButton, AppText } from '@/components/primitives';
import { spacing } from '@/theme';

import { MAX_PROFILE_PHOTO_BYTES, type PhotoFile } from '../api/mediaApi';

interface ProfilePhotoPickerProps {
  disabled?: boolean;
  fallbackUri?: string | null;
  onChange(photo: PhotoFile | null): void;
  value: PhotoFile | null;
}

function fileNameFromUri(uri: string): string {
  const lastSegment = uri.split('/').pop() ?? '';
  const withoutQuery = lastSegment.split('?')[0] ?? '';
  return withoutQuery !== '' ? withoutQuery : `photo-${String(Date.now())}.jpg`;
}

export function ProfilePhotoPicker({
  disabled = false,
  fallbackUri = null,
  onChange,
  value,
}: ProfilePhotoPickerProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);

  async function handlePickPhoto(): Promise<void> {
    if (isPicking || disabled) {
      return;
    }
    setPickerError(null);
    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPickerError('Necesitamos acceso a tus fotos para elegir la foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      if (asset === undefined) {
        return;
      }

      const mimeType = asset.mimeType ?? 'image/jpeg';
      if (!mimeType.startsWith('image/')) {
        setPickerError('El archivo elegido no es una imagen válida.');
        return;
      }
      if (asset.fileSize != null && asset.fileSize > MAX_PROFILE_PHOTO_BYTES) {
        setPickerError('La foto supera los 10 MB. Elige una imagen más liviana.');
        return;
      }

      onChange({
        uri: asset.uri,
        name: fileNameFromUri(asset.uri),
        mimeType,
        ...(asset.fileSize != null ? { size: asset.fileSize } : {}),
      });
    } finally {
      setIsPicking(false);
    }
  }

  const busy = isPicking || disabled;
  const displayUri = value ? { uri: value.uri } : fallbackUri ? { uri: fallbackUri } : undefined;
  const photoLabel = value
    ? `Foto de perfil seleccionada para ${value.name}`
    : fallbackUri
      ? 'Foto de perfil actual'
      : 'Sin foto de perfil';

  return (
    <View style={styles.container}>
      <AppAvatar accessibilityLabel={photoLabel} initials="?" size="lg" source={displayUri} />
      <View style={styles.actions}>
        <AppButton
          disabled={busy}
          label={value ? 'Cambiar foto' : 'Elegir foto'}
          loading={isPicking}
          onPress={() => void handlePickPhoto()}
          variant="secondary"
        />
        {value ? (
          <AppButton
            disabled={disabled}
            label="Quitar"
            onPress={() => onChange(null)}
            variant="ghost"
          />
        ) : null}
      </View>
      {pickerError ? (
        <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
          {pickerError}
        </AppText>
      ) : null}
      <AppText color="textSecondary" variant="caption">
        Opcional. Usa un retrato con el rostro visible, de hasta 10 MB.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  container: {
    gap: spacing.sm,
  },
});
