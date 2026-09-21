import type { ComponentProps } from 'react';

import { FeedbackState } from './FeedbackState';

export type ErrorStateProps = Omit<ComponentProps<typeof FeedbackState>, 'icon' | 'tone'>;

export function ErrorState(props: ErrorStateProps) {
  return <FeedbackState icon="error" tone="danger" {...props} />;
}
