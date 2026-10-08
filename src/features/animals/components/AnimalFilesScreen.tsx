import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorState, LoadingState, MediaUploadStatus, OfflineState } from '@/components/feedback';
import { offlineCopy } from '@/components/feedback/offlineCopy';
import { ScreenHeader } from '@/components/patterns';
import { AppButton, AppCard, AppText } from '@/components/primitives';
import { isNetworkError } from '@/core/network';
import { spacing } from '@/theme';

import type { AnimalFileUpload } from '../api/animalFilesApi';
import { useAnimal } from '../hooks/useAnimal';
import { useAnimalFiles } from '../hooks/useAnimalFiles';
import { useDeleteAnimalFile } from '../hooks/useDeleteAnimalFile';
import { useUploadAnimalFile } from '../hooks/useUploadAnimalFile';
import { flattenAnimalFilesPages } from '../types';
import {
  toAnimalFileDeleteErrorMessage,
  toAnimalFileUploadErrorMessage,
} from '../utils/animalErrorMessages';
import { AnimalFilesGrid } from './AnimalFilesGrid';
import { AnimalFileUploader } from './AnimalFileUploader';

export interface AnimalFilesScreenProps {
  animalId: string;
  canWrite: boolean;
}

/**
 * Animal archive screen (D17 / RFG-150).
 *
 * Loads the paginated media owned by the animal, filters the current profile
 * photo so it is never duplicated, and coordinates upload (direct link with
 * `ownerType=animal`), deletion with confirmation and the corresponding
 * loading/empty/offline/error states. Writing is gated by `canWrite`; the
 * backend remains the final authority and a `403` is surfaced safely.
 */
export function AnimalFilesScreen({ animalId, canWrite }: AnimalFilesScreenProps) {
  const animalQuery = useAnimal(animalId);
  const filesQuery = useAnimalFiles(animalId);
  const uploadAnimalFile = useUploadAnimalFile(animalId);
  const deleteAnimalFile = useDeleteAnimalFile(animalId);
  const [pendingFile, setPendingFile] = useState<AnimalFileUpload | null>(null);

  const excludedMediaId = animalQuery.data?.profilePhotoMediaId ?? null;
  const files = useMemo(
    () => flattenAnimalFilesPages(filesQuery.data?.pages, excludedMediaId),
    [filesQuery.data?.pages, excludedMediaId]
  );

  const refresh = useCallback(() => {
    void filesQuery.refetch();
  }, [filesQuery]);

  const loadMore = useCallback(() => {
    if (filesQuery.hasNextPage && !filesQuery.isFetchingNextPage) void filesQuery.fetchNextPage();
  }, [filesQuery]);

  const handleSelect = useCallback(
    (file: AnimalFileUpload) => {
      setPendingFile(file);
      uploadAnimalFile.mutate({ file }, { onSuccess: () => setPendingFile(null) });
    },
    [uploadAnimalFile]
  );

  const handleRetryUpload = useCallback(() => {
    if (pendingFile !== null) uploadAnimalFile.mutate({ file: pendingFile });
  }, [pendingFile, uploadAnimalFile]);

  if (animalQuery.isPending) {
    return (
      <View style={styles.centered}>
        <LoadingState label="Cargando archivos" />
      </View>
    );
  }

  if (animalQuery.isError) {
    const offline = isNetworkError(animalQuery.error);
    return (
      <View style={styles.centered}>
        {offline ? (
          <OfflineState
            actionLabel={offlineCopy.actionLabel}
            message={offlineCopy.message}
            onAction={() => void animalQuery.refetch()}
            title={offlineCopy.title}
          />
        ) : (
          <ErrorState
            actionLabel="Reintentar"
            message="No pudimos cargar la ficha del animal."
            onAction={() => void animalQuery.refetch()}
            title="No se pudo cargar el animal"
          />
        )}
      </View>
    );
  }

  const animal = animalQuery.data;
  const uploadProgress = uploadAnimalFile.upload;
  const uploadError = uploadAnimalFile.error
    ? toAnimalFileUploadErrorMessage(uploadAnimalFile.error)
    : null;
  const deleteError = deleteAnimalFile.error
    ? toAnimalFileDeleteErrorMessage(deleteAnimalFile.error)
    : null;

  const header = (
    <>
      <ScreenHeader subtitle={animal ? `Archivos de ${animal.name}` : undefined} title="Archivos" />
      {canWrite ? (
        <AppCard style={styles.uploaderCard} variant="elevated">
          <AnimalFileUploader canUpload={canWrite} onSelect={handleSelect} />
          {uploadProgress ? (
            <MediaUploadStatus
              fileName={uploadProgress.fileName}
              onCancel={uploadAnimalFile.cancelUpload}
              progress={uploadProgress.progress}
              status="uploading"
            />
          ) : null}
          {uploadError && pendingFile && !uploadAnimalFile.isPending ? (
            <View style={styles.uploadError}>
              <MediaUploadStatus errorMessage={uploadError} progress={0} status="error" />
              <AppButton
                icon="refresh"
                label="Reintentar subida"
                onPress={handleRetryUpload}
                testID="animal-files-upload-retry"
                variant="secondary"
              />
            </View>
          ) : null}
        </AppCard>
      ) : null}
      {deleteError ? (
        <AppText accessibilityLiveRegion="assertive" color="danger" role="alert">
          {deleteError}
        </AppText>
      ) : null}
    </>
  );

  return (
    <AnimalFilesGrid
      canDelete={canWrite}
      deletingId={deleteAnimalFile.isPending ? (deleteAnimalFile.variables ?? null) : null}
      files={files}
      hasNextPage={filesQuery.hasNextPage}
      header={header}
      isError={filesQuery.isError}
      isFetchingNextPage={filesQuery.isFetchingNextPage}
      isOffline={filesQuery.isError && isNetworkError(filesQuery.error)}
      isPending={filesQuery.isPending}
      isRefreshing={filesQuery.isRefetching && !filesQuery.isFetchingNextPage}
      onDelete={(id) => deleteAnimalFile.mutate(id)}
      onLoadMore={loadMore}
      onRefresh={refresh}
      onRetry={refresh}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: spacing.lg,
  },
  uploadError: { gap: spacing.xs },
  uploaderCard: { gap: spacing.sm },
});
