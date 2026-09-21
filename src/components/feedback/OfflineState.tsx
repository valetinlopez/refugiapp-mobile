import type { ComponentProps } from 'react';

import { FeedbackState } from './FeedbackState';

export type OfflineStateProps = Omit<ComponentProps<typeof FeedbackState>, 'icon' | 'tone'>;

export function OfflineState(props: OfflineStateProps) {
  return <FeedbackState icon="offline" tone="info" {...props} />;
}
