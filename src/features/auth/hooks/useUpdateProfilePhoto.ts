import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { UploadCancelledError } from '@/core/media';

import { profileApi, type ProfilePhotoFile } from '../api/profileApi';
import { authApi } from '../api/authApi';
import type { User } from '../types';
import { ProfilePhotoError } from '../utils/profilePhotoErrorMessages';

import { userAvatarKeys } from './userAvatarKeys';

export interface UpdateProfilePhotoInput {
  userId: string;
  photo: ProfilePhotoFile | null;
  removePhoto?: boolean;
}

export function useUpdateProfilePhoto() {
  const queryClient = useQueryClient();
  const abortController = useRef<AbortController | null>(null);
  const [upload, setUpload] = useState<{ fileName: string; progress: number } | null>(null);

  const mutation = useMutation<User, ProfilePhotoError, UpdateProfilePhotoInput>({
    mutationFn: async ({ photo, removePhoto = false, userId }) => {
      let profilePhotoMediaId: string | null | undefined;

      if (photo !== null) {
        abortController.current = new AbortController();
        setUpload({ fileName: photo.name, progress: 0 });
        try {
          const asset = await profileApi.uploadOrphanAvatar(photo, undefined, {
            signal: abortController.current.signal,
            onUploadProgress: (progress) => setUpload({ fileName: photo.name, progress }),
          });
          profilePhotoMediaId = asset.id;
        } catch (error) {
          if (abortController.current.signal.aborted) {
            throw new ProfilePhotoError('photo', new UploadCancelledError());
          }
          throw new ProfilePhotoError('photo', error);
        } finally {
          setUpload(null);
        }
      } else if (removePhoto) {
        profilePhotoMediaId = null;
      } else {
        throw new ProfilePhotoError('photo', new Error('Invalid profile photo: missing'));
      }

      try {
        await profileApi.updatePhoto(userId, profilePhotoMediaId);
      } catch (error) {
        if (profilePhotoMediaId !== null && profilePhotoMediaId !== undefined) {
          await profileApi.deleteAsset(profilePhotoMediaId).catch(() => undefined);
        }
        throw new ProfilePhotoError('update', error);
      }

      try {
        return await authApi.getCurrentUser();
      } catch (error) {
        throw new ProfilePhotoError('update', error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userAvatarKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['veterinarians'] });
    },
    onSettled: () => {
      abortController.current = null;
      setUpload(null);
    },
  });

  return { ...mutation, cancelUpload: () => abortController.current?.abort(), upload };
}
