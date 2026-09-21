import type { ComponentProps } from 'react';

import { FeedbackState } from './FeedbackState';

export type EmptyStateProps = Omit<ComponentProps<typeof FeedbackState>, 'icon' | 'tone'>;

export function EmptyState(props: EmptyStateProps) {
  return <FeedbackState icon="heart" tone="neutral" {...props} />;
}
