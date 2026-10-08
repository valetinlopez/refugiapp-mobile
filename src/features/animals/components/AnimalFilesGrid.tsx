import { Image } from 'expo-image';
import { memo, useCallback, useState, type ReactNode } from 'react';
import {
  FlatList,
  PixelRatio,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
} from '@/components/feedback';
import { OFFLINE_STATE_TEST_ID, offlineCopy } from '@/components/feedback/offlineCopy';
import { virtualizedListPerformanceProps } from '@/components/performance';
import { AppButton, AppIcon, AppText } from '@/components/primitives';
import { optimizeCloudinaryImageUrl } from '@/core/media';
import { colors, radii, sizes, spacing } from '@/theme';

import type { AnimalFile } from '../types';

const COLUMNS = 2;

export interface AnimalFilesGridProps {
  canDelete: boolean;
  deletingId?: string | null;
  files: readonly AnimalFile[];
  hasNextPage: boolean;
  header?: ReactNode;
  isError: boolean;
  isFetchingNextPage: boolean;
  isOffline: boolean;
  isPending: boolean;
  isRefreshing: boolean;
  onDelete(id: string): void;
  onLoadMore(): void;
  onRefresh(): void;
  onRetry(): void;
}

interface AnimalFileTileProps {
  canDelete: boolean;
  file: AnimalFile;
  onRequestRemove(id: string): void;
  removeDisabled: boolean;
  size: number;
}

const AnimalFileTile = memo(function AnimalFileTile({
  canDelete,
  file,
  onRequestRemove,
  removeDisabled,
  size,
}: AnimalFileTileProps) {
  const thumbnailUri = file.isImage
    ? optimizeCloudinaryImageUrl(file.secureUrl, { width: size * PixelRatio.get() })
    : null;

  return (
    <View style={[styles.tile, { width: size }]} testID={`animal-file-${file.id}`}>
      <View style={[styles.preview, { height: size }]}>
        {thumbnailUri ? (
          <Image
            accessibilityElementsHidden
            allowDownscaling
            cachePolicy="memory-disk"
            contentFit="cover"
            importantForAccessibility="no-hide-descendants"
            recyclingKey={thumbnailUri}
            source={{ uri: thumbnailUri }}
            style={styles.image}
            testID={`animal-file-image-${file.id}`}
          />
        ) : (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.glyph}
          >
            <AppIcon color="textSecondary" name="document" size={sizes.iconLg} />
            <AppText color="textSecondary" variant="caption">
              PDF
            </AppText>
          </View>
        )}
      </View>
      <View style={styles.tileFooter}>
        <AppText numberOfLines={2} style={styles.tileName} variant="caption">
          {file.name}
        </AppText>
        {canDelete ? (
          <AppButton
            accessibilityLabel={`Eliminar ${file.name}`}
            disabled={removeDisabled}
            icon="trash"
            label=""
            onPress={() => onRequestRemove(file.id)}
            testID={`animal-file-remove-${file.id}`}
            variant="ghost"
          />
        ) : null}
      </View>
    </View>
  );
});

/**
 * Paginated archive grid for an animal (D17 / RFG-150).
 *
 * Renders images as optimized Cloudinary thumbnails and any other resource
 * (PDF) with a document glyph. It owns the destructive confirmation: a tile's
 * remove action only opens a `ConfirmDialog`, and `onDelete` runs after the
 * explicit confirmation, honouring the design-system rule. Loading, empty,
 * offline and error states are handled before the grid, and the current
 * profile photo is already filtered out by the caller.
 */
export function AnimalFilesGrid({
  canDelete,
  deletingId = null,
  files,
  hasNextPage,
  header,
  isError,
  isFetchingNextPage,
  isOffline,
  isPending,
  isRefreshing,
  onDelete,
  onLoadMore,
  onRefresh,
  onRetry,
}: AnimalFilesGridProps) {
  const { width } = useWindowDimensions();
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const tileSize = Math.max(
    sizes.touchTarget,
    (width - spacing.lg * 2 - spacing.sm * (COLUMNS - 1)) / COLUMNS
  );

  const handleRequestRemove = useCallback((id: string) => setPendingRemovalId(id), []);
  const pendingRemoval = files.find((file) => file.id === pendingRemovalId) ?? null;

  const renderItem = useCallback(
    ({ item }: { item: AnimalFile }) => (
      <AnimalFileTile
        canDelete={canDelete}
        file={item}
        onRequestRemove={handleRequestRemove}
        removeDisabled={deletingId !== null}
        size={tileSize}
      />
    ),
    [canDelete, deletingId, handleRequestRemove, tileSize]
  );

  const emptyState = isPending ? (
    <LoadingState label="Cargando archivos" />
  ) : isError ? (
    isOffline ? (
      <OfflineState
        actionLabel={offlineCopy.actionLabel}
        message={offlineCopy.message}
        onAction={onRetry}
        testID={OFFLINE_STATE_TEST_ID}
        title={offlineCopy.title}
      />
    ) : (
      <ErrorState
        actionLabel="Reintentar"
        message="No pudimos cargar los archivos del animal."
        onAction={onRetry}
        title="No se pudieron cargar los archivos"
      />
    )
  ) : (
    <EmptyState
      message="Todavía no hay archivos cargados para este animal."
      testID="animal-files-empty"
      title="Sin archivos"
    />
  );

  return (
    <>
      <FlatList
        {...virtualizedListPerformanceProps}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        data={files}
        keyExtractor={(file) => file.id}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          files.length === 0 ? null : isFetchingNextPage ? (
            <LoadingState label="Cargando más archivos" />
          ) : hasNextPage ? (
            <AppButton
              label="Cargar más archivos"
              onPress={onLoadMore}
              testID="animal-files-load-more"
              variant="secondary"
            />
          ) : (
            <AppText
              color="textSecondary"
              style={styles.endOfList}
              testID="animal-files-end-of-list"
            >
              No hay más archivos
            </AppText>
          )
        }
        ListHeaderComponent={header ? <View style={styles.header}>{header}</View> : null}
        numColumns={COLUMNS}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            colors={[colors.positive]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={colors.positive}
          />
        }
        renderItem={renderItem}
        testID="animal-files-list"
      />
      <ConfirmDialog
        confirmLabel="Eliminar"
        confirming={deletingId !== null}
        consequence={
          pendingRemoval
            ? `“${pendingRemoval.name}” se eliminará definitivamente del animal.`
            : 'El archivo se eliminará definitivamente.'
        }
        onCancel={() => setPendingRemovalId(null)}
        onConfirm={() => {
          if (pendingRemovalId !== null) onDelete(pendingRemovalId);
          setPendingRemovalId(null);
        }}
        title="¿Querés eliminar este archivo?"
        variant="danger"
        visible={pendingRemovalId !== null}
      />
    </>
  );
}

const styles = StyleSheet.create({
  columns: {
    gap: spacing.sm,
  },
  endOfList: { paddingVertical: spacing.sm, textAlign: 'center' },
  glyph: {
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  header: { gap: spacing.lg, width: '100%' },
  image: { height: '100%', width: '100%' },
  list: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  preview: {
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    width: '100%',
  },
  tile: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  tileFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.sm,
    paddingRight: spacing.xxs,
  },
  tileName: { flex: 1, minWidth: 0 },
});
