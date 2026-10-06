import { useState } from 'react';
import { Image, type ImageContentFit, type ImageSource } from 'expo-image';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

export type DecorativeImagePriority = 'low' | 'normal' | 'high';

export interface DecorativeImageProps {
  /** Primary raster source (WebP for the bundled brand assets). */
  source: ImageSource | number;
  /** Fallback rendered only if the primary fails to decode (e.g. PNG). */
  fallbackSource?: ImageSource | number;
  /** How the source fits the box. Defaults to `contain`. */
  contentFit?: ImageContentFit;
  /**
   * Aspect ratio reserved in the layout before the image loads, avoiding
   * layout shift with dynamic font settings or slow rendering.
   */
  aspectRatio?: number;
  /**
   * Meaningful alternative text. When omitted the image is decorative and is
   * hidden from assistive technologies (RFC D02: decorative assets never
   * communicate state nor carry functional text).
   */
  accessibilityLabel?: string;
  /** Loading priority. Defaults to `low` for decorative, non-critical media. */
  priority?: DecorativeImagePriority;
  /** Key used by expo-image to recycle views in lists. */
  recyclingKey?: string;
  /** Identity forwarded to the underlying Image for E2E selectors. */
  testID?: string;
  style?: StyleProp<ImageStyle>;
}

const DEFAULT_PRIORITY: DecorativeImagePriority = 'low';

function sourceKey(source: ImageSource | number): string | number | null {
  if (typeof source === 'number') return source;
  return source.uri ?? null;
}

export function DecorativeImage({
  accessibilityLabel,
  aspectRatio,
  contentFit = 'contain',
  fallbackSource,
  priority = DEFAULT_PRIORITY,
  recyclingKey,
  source,
  style,
  testID,
}: DecorativeImageProps) {
  const hasLabel = accessibilityLabel !== undefined && accessibilityLabel.length > 0;
  const currentSourceKey = sourceKey(source);
  const [failedSource, setFailedSource] = useState<string | number | null>(null);

  const imageFailed = currentSourceKey !== null && failedSource === currentSourceKey;
  const activeSource = imageFailed && fallbackSource !== undefined ? fallbackSource : source;

  const accessibilityProps = hasLabel
    ? {
        accessible: true,
        accessibilityElementsHidden: false,
        accessibilityLabel,
        alt: accessibilityLabel,
        importantForAccessibility: 'yes' as const,
      }
    : {
        accessible: false,
        accessibilityElementsHidden: true,
        alt: '',
        importantForAccessibility: 'no-hide-descendants' as const,
      };

  const fallbackProps =
    fallbackSource !== undefined ? { onError: () => setFailedSource(currentSourceKey) } : {};

  return (
    <Image
      {...accessibilityProps}
      {...fallbackProps}
      allowDownscaling
      cachePolicy="memory-disk"
      contentFit={contentFit}
      priority={priority}
      recyclingKey={recyclingKey ?? (currentSourceKey !== null ? String(currentSourceKey) : null)}
      source={activeSource}
      style={[styles.base, aspectRatio !== undefined ? { aspectRatio } : null, style]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
});
