import { StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '@/theme';

import { AppButton, AppText } from '../primitives';

export interface MediaUploadStatusProps {
  errorMessage?: string | null;
  fileName?: string;
  onCancel?(): void;
  progress: number;
  status: 'error' | 'uploading';
}

export function MediaUploadStatus({
  errorMessage,
  fileName,
  onCancel,
  progress,
  status,
}: MediaUploadStatusProps) {
  const percentage = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <AppText accessibilityLiveRegion="assertive" color="danger" role="alert">
          {errorMessage ?? 'No pudimos subir el archivo.'}
        </AppText>
      </View>
    );
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <View style={styles.header}>
        <AppText numberOfLines={1} style={styles.fileName} variant="label">
          {fileName ? `Subiendo ${fileName}` : 'Subiendo archivo'}
        </AppText>
        <AppText color="textSecondary" variant="caption">
          {percentage}%
        </AppText>
      </View>
      <View
        accessibilityLabel="Progreso de subida"
        accessibilityRole="progressbar"
        accessibilityValue={{ max: 100, min: 0, now: percentage }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
      {onCancel ? <AppButton label="Cancelar subida" onPress={onCancel} variant="ghost" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  fileName: { flex: 1 },
  fill: {
    backgroundColor: colors.info,
    borderRadius: radii.full,
    height: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  track: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.full,
    height: sizes.divider * 8,
    overflow: 'hidden',
  },
});
