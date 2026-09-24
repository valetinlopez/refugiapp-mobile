import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AppAvatar, AppButton, AppText } from '@/components/primitives';
import {
  IMAGE_MEDIA_TYPES,
  normalizeMediaFileName,
  resolveMediaMimeType,
  validateMediaFile,
} from '@/core/media';
import { spacing } from '@/theme';

import type { PhotoFile } from '../api/mediaApi';

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
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  async function handlePickPhoto(source: 'camera' | 'gallery'): Promise<void> {
    if (isPicking || disabled) return;
    setPickerError(null);
    setPermissionBlocked(false);
    setIsPicking(true);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        const canAskAgain = permission.canAskAgain !== false;
        setPermissionBlocked(!canAskAgain);
        setPickerError(
          canAskAgain
            ? source === 'camera'
              ? 'Necesitamos acceso a la cámara para tomar la foto de perfil.'
              : 'Necesitamos acceso a tus fotos para elegir la foto de perfil.'
            : source === 'camera'
              ? 'El acceso a la cámara está bloqueado. Habilitalo en los ajustes del dispositivo para tomar la foto.'
              : 'El acceso a tus fotos está bloqueado. Habilitalo en los ajustes del dispositivo para elegir una imagen.'
        );
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset === undefined) return;

      const name = asset.fileName ?? fileNameFromUri(asset.uri);
      const mimeType = resolveMediaMimeType(name, asset.mimeType);
      const photo: PhotoFile = {
        uri: asset.uri,
        name: normalizeMediaFileName(name, mimeType),
        mimeType,
        ...(asset.fileSize != null ? { size: asset.fileSize } : {}),
        ...(asset.file !== undefined ? { file: asset.file } : {}),
      };
      const validationError = validateMediaFile(photo, IMAGE_MEDIA_TYPES);
      if (validationError === 'invalid_type') {
        setPickerError('El archivo elegido no es una imagen JPEG, PNG o WebP válida.');
        return;
      }
      if (validationError === 'file_too_large') {
        setPickerError('La foto supera los 10 MB. Elegí una imagen más liviana.');
        return;
      }
      onChange(photo);
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
          label="Tomar foto"
          loading={isPicking}
          onPress={() => void handlePickPhoto('camera')}
          variant="secondary"
        />
        <AppButton
          disabled={busy}
          label={value ? 'Cambiar desde galería' : 'Elegir de galería'}
          onPress={() => void handlePickPhoto('gallery')}
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
        <View style={styles.permissionBlock}>
          <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
            {pickerError}
          </AppText>
          {permissionBlocked ? (
            <AppButton
              label="Abrir ajustes"
              onPress={() => void Linking.openSettings()}
              variant="secondary"
            />
          ) : null}
        </View>
      ) : null}
      <AppText color="textSecondary" variant="caption">
        Opcional. Tomá una foto o elegí una imagen JPEG, PNG o WebP de hasta 10 MB.
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
  permissionBlock: {
    gap: spacing.sm,
  },
});
