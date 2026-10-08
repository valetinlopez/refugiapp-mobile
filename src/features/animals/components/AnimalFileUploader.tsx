import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/feedback';
import { AppButton, AppText } from '@/components/primitives';
import {
  DOCUMENT_MEDIA_TYPES,
  normalizeMediaFileName,
  resolveMediaMimeType,
  validateMediaFile,
} from '@/core/media';
import { spacing } from '@/theme';

import type { AnimalFileUpload } from '../api/animalFilesApi';

const MAX_FILES_HINT = 'JPEG, PNG, WebP o PDF de hasta 10 MB.';

interface AnimalFileUploaderProps {
  canUpload: boolean;
  disabled?: boolean;
  onSelect(file: AnimalFileUpload): void;
}

function fileNameFromUri(uri: string, fallback: string): string {
  const lastSegment = uri.split('/').pop() ?? '';
  const withoutQuery = lastSegment.split('?')[0] ?? '';
  return withoutQuery !== '' ? withoutQuery : fallback;
}

/**
 * Picks a file for the animal's archive (D17 / RFG-150).
 *
 * Supports camera, gallery and PDF (mirror of the clinical picker), validates
 * the MIME type and size against the shared media rules and delegates the
 * actual upload to the screen. Permission denial is explained and, when
 * permanently blocked, offers the device settings. This component never talks
 * to the network.
 */
export function AnimalFileUploader({
  canUpload,
  disabled = false,
  onSelect,
}: AnimalFileUploaderProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  if (!canUpload) return null;

  const busy = isPicking || disabled;

  function validate(file: AnimalFileUpload): boolean {
    const validationError = validateMediaFile(file, DOCUMENT_MEDIA_TYPES);
    if (validationError === 'invalid_type') {
      setPickerError('Solo podés subir imágenes JPEG, PNG o WebP y documentos PDF.');
      return false;
    }
    if (validationError === 'file_too_large') {
      setPickerError('El archivo supera los 10 MB. Elegí uno más liviano.');
      return false;
    }
    return true;
  }

  async function handlePickImage(source: 'camera' | 'gallery'): Promise<void> {
    if (busy) return;
    setSheetVisible(false);
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
              ? 'Necesitamos acceso a la cámara para fotografiar el archivo.'
              : 'Necesitamos acceso a tus fotos para adjuntar archivos.'
            : source === 'camera'
              ? 'El acceso a la cámara está bloqueado. Habilitalo en los ajustes del dispositivo.'
              : 'El acceso a tus fotos está bloqueado. Habilitalo en los ajustes del dispositivo.'
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

      const name = asset.fileName ?? fileNameFromUri(asset.uri, `archivo-${Date.now()}.jpg`);
      const mimeType = resolveMediaMimeType(name, asset.mimeType);
      const file: AnimalFileUpload = {
        uri: asset.uri,
        name: normalizeMediaFileName(name, mimeType),
        mimeType,
        ...(asset.fileSize != null ? { size: asset.fileSize } : {}),
        ...(asset.file !== undefined ? { file: asset.file } : {}),
      };
      if (validate(file)) onSelect(file);
    } finally {
      setIsPicking(false);
    }
  }

  async function handlePickDocument(): Promise<void> {
    if (busy) return;
    setSheetVisible(false);
    setPickerError(null);
    setPermissionBlocked(false);
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: 'application/pdf',
      });
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset === undefined) return;
      const mimeType = asset.mimeType ?? 'application/pdf';
      const file: AnimalFileUpload = {
        uri: asset.uri,
        name: normalizeMediaFileName(asset.name, mimeType),
        mimeType,
        ...(asset.size != null ? { size: asset.size } : {}),
        ...(asset.file !== undefined ? { file: asset.file } : {}),
      };
      if (validate(file)) onSelect(file);
    } finally {
      setIsPicking(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppButton
        disabled={busy}
        icon="add"
        label="Agregar archivo"
        loading={isPicking}
        onPress={() => setSheetVisible(true)}
        testID="animal-files-add"
      />
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
        {MAX_FILES_HINT}
      </AppText>

      <BottomSheet
        onClose={() => setSheetVisible(false)}
        testID="animal-files-source-sheet"
        title="Agregar archivo"
        visible={sheetVisible}
      >
        <AppButton
          disabled={busy}
          icon="camera"
          label="Tomar foto"
          onPress={() => void handlePickImage('camera')}
          style={styles.sheetAction}
          testID="animal-files-add-camera"
          variant="secondary"
        />
        <AppButton
          disabled={busy}
          label="Elegir imagen"
          onPress={() => void handlePickImage('gallery')}
          style={styles.sheetAction}
          testID="animal-files-add-gallery"
          variant="secondary"
        />
        <AppButton
          disabled={busy}
          icon="document"
          label="Elegir PDF"
          onPress={() => void handlePickDocument()}
          style={styles.sheetAction}
          testID="animal-files-add-document"
          variant="secondary"
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  permissionBlock: { gap: spacing.sm },
  sheetAction: { width: '100%' },
});
