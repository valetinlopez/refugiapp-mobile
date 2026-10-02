import { Platform } from 'react-native';

export const virtualizedListPerformanceProps = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 8,
  removeClippedSubviews: Platform.OS === 'android',
  updateCellsBatchingPeriod: 50,
  windowSize: 7,
} as const;
