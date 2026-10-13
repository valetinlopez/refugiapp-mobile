import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { BottomSheet, ConfirmDialog, MediaUploadStatus } from '@/components/feedback';
import { AppButton, AppText } from '@/components/primitives';
import {
  IMAGE_MEDIA_TYPES,
  normalizeMediaFileName,
  resolveMediaMimeType,
  validateMediaFile,
} from '@/core/media';
import { spacing } from '@/theme';

import type { ProfilePhotoFile } from '../api/profileApi';
import { useSession } from '../session';
import { accountDisplayName, accountInitials } from '../utils/accountPresentation';
import { ProfilePhotoError, toProfilePhotoErrorMessage } from '../utils/profilePhotoErrorMessages';
import type { User } from '../types';
import { useUserAvatar } from '../hooks/useUserAvatar';
import { useUpdateProfilePhoto } from '../hooks/useUpdateProfilePhoto';

import { UserAvatar } from './UserAvatar';

type PhotoSource = 'camera' | 'gallery';

function fileNameFromUri(uri: string): string {
  const lastSegment = uri.split('/').pop() ?? '';
  const withoutQuery = lastSegment.split('?')[0] ?? '';
  return withoutQuery !== '' ? withoutQuery : `photo-${String(Date.now())}.jpg`;
}

export function ProfilePhotoSection({ user }: { user: User }) {
  const { refreshUser } = useSession();
  const avatarQuery = useUserAvatar(user.profilePhotoMediaId ?? null);
  const mutation = useUpdateProfilePhoto();

  const [selected, setSelected] = useState<ProfilePhotoFile | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [sourceSheetVisible, setSourceSheetVisible] = useState(false);
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const isBusy = isPicking || mutation.isPending;
  const displayName = accountDisplayName(user);
  const remoteUri = avatarQuery.data ?? null;
  const hasPhoto = user.profilePhotoMediaId !== null && user.profilePhotoMediaId !== undefined;
  const mutationError =
    mutation.error instanceof ProfilePhotoError ? toProfilePhotoErrorMessage(mutation.error) : null;

  const handlePickPhoto = useCallback(
    async (source: PhotoSource): Promise<void> => {
      if (isPicking || mutation.isPending) return;
      setSourceSheetVisible(false);
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
                ? 'Necesitamos acceso a la cámara para tomar tu foto de perfil.'
                : 'Necesitamos acceso a tus fotos para elegir tu foto de perfil.'
              : source === 'camera'
                ? 'El acceso a la cámara está bloqueado. Habilitalo en los ajustes del dispositivo para tomar la foto.'
                : 'El acceso a tus fotos está bloqueado. Habilitalo en los ajustes del dispositivo para elegir una imagen.'
          );
          return;
        }

        const result =
          source === 'camera'
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
        const asset = result.canceled ? undefined : result.assets[0];
        if (asset === undefined) return;

        const name = asset.fileName ?? fileNameFromUri(asset.uri);
        const mimeType = resolveMediaMimeType(name, asset.mimeType);
        const photo: ProfilePhotoFile = {
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
        mutation.reset();
        setSelected(photo);
      } finally {
        setIsPicking(false);
      }
    },
    [isPicking, mutation]
  );

  const handleConfirm = useCallback(() => {
    if (selected === null || mutation.isPending) return;
    mutation.mutate(
      { photo: selected, userId: user.id },
      {
        onSuccess: () => {
          setSelected(null);
          setAnnouncement('Foto de perfil actualizada.');
          void refreshUser();
        },
      }
    );
  }, [mutation, refreshUser, selected, user.id]);

  const handleRemove = useCallback(() => {
    if (mutation.isPending) return;
    setRemoveDialogVisible(false);
    setSelected(null);
    mutation.mutate(
      { photo: null, removePhoto: true, userId: user.id },
      {
        onSuccess: () => {
          setAnnouncement('Foto de perfil eliminada. Ahora se muestran tus iniciales.');
          void refreshUser();
        },
      }
    );
  }, [mutation, refreshUser, user.id]);

  return (
    <View style={styles.container} testID="profile-photo-section">
      <View style={styles.row}>
        <UserAvatar
          displayName={displayName}
          initials={accountInitials(user)}
          photoUri={selected?.uri ?? remoteUri}
        />
        <View style={styles.actions}>
          <AppButton
            disabled={isBusy}
            icon="camera"
            label="Cambiar foto"
            loading={isPicking}
            onPress={() => setSourceSheetVisible(true)}
            testID="profile-photo-change"
            variant="secondary"
          />
          {hasPhoto || selected !== null ? (
            <AppButton
              disabled={mutation.isPending}
              icon="trash"
              label="Quitar"
              onPress={() => {
                if (selected !== null) {
                  setSelected(null);
                  return;
                }
                setRemoveDialogVisible(true);
              }}
              testID="profile-photo-remove"
              variant="secondary"
            />
          ) : null}
        </View>
      </View>

      <AppText color="textSecondary" variant="caption">
        Opcional. Usá una imagen cuadrada JPEG, PNG o WebP de hasta 10 MB. Sin foto se muestran tus
        iniciales.
      </AppText>

      {selected !== null ? (
        <View style={styles.previewActions}>
          <AppButton
            label="Confirmar foto"
            loading={mutation.isPending}
            onPress={handleConfirm}
            testID="profile-photo-confirm"
          />
          <AppButton
            disabled={mutation.isPending}
            label="Descartar"
            onPress={() => {
              mutation.reset();
              setSelected(null);
            }}
            testID="profile-photo-discard"
            variant="ghost"
          />
        </View>
      ) : null}

      {mutation.upload ? (
        <MediaUploadStatus
          fileName={mutation.upload.fileName}
          onCancel={mutation.cancelUpload}
          progress={mutation.upload.progress}
          status="uploading"
        />
      ) : null}

      {pickerError ? (
        <View style={styles.errorBlock}>
          <AppText accessibilityLiveRegion="polite" color="danger" role="alert">
            {pickerError}
          </AppText>
          {permissionBlocked ? (
            <AppButton
              label="Abrir ajustes"
              onPress={() => void Linking.openSettings()}
              testID="profile-photo-open-settings"
              variant="secondary"
            />
          ) : (
            <AppButton
              label="Reintentar"
              onPress={() => setSourceSheetVisible(true)}
              testID="profile-photo-retry-picker"
              variant="secondary"
            />
          )}
        </View>
      ) : null}

      {mutationError ? (
        <View style={styles.errorBlock}>
          <AppText accessibilityLiveRegion="assertive" color="danger" role="alert">
            {mutationError}
          </AppText>
          <AppButton
            disabled={mutation.isPending}
            label="Reintentar"
            onPress={() => {
              if (selected !== null) {
                handleConfirm();
              } else {
                setSourceSheetVisible(true);
              }
            }}
            testID="profile-photo-retry"
            variant="secondary"
          />
        </View>
      ) : null}

      {announcement && !mutationError && !pickerError ? (
        <AppText accessibilityLiveRegion="polite" color="positive" variant="caption">
          {announcement}
        </AppText>
      ) : null}

      <BottomSheet
        onClose={() => setSourceSheetVisible(false)}
        testID="profile-photo-source-sheet"
        title="Cambiar foto"
        visible={sourceSheetVisible}
      >
        <AppButton
          disabled={isBusy}
          icon="camera"
          label="Tomar foto"
          onPress={() => void handlePickPhoto('camera')}
          style={styles.sheetAction}
          testID="profile-photo-take"
          variant="secondary"
        />
        <AppButton
          disabled={isBusy}
          label="Elegir de galería"
          onPress={() => void handlePickPhoto('gallery')}
          style={styles.sheetAction}
          testID="profile-photo-pick"
          variant="secondary"
        />
      </BottomSheet>

      <ConfirmDialog
        confirmLabel="Quitar foto"
        confirming={mutation.isPending}
        consequence="Se eliminará tu foto y volverán a mostrarse tus iniciales en todos tus dispositivos."
        onCancel={() => setRemoveDialogVisible(false)}
        onConfirm={handleRemove}
        title="Quitar foto de perfil"
        visible={removeDialogVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  container: {
    gap: spacing.sm,
  },
  errorBlock: {
    gap: spacing.sm,
  },
  previewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  sheetAction: {
    width: '100%',
  },
});
