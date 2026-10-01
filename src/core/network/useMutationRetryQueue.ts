import { onlineManager } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import {
  MutationRetryQueue,
  type MutationQueueOutcome,
  type MutationRetryQueueOptions,
  type RetryableMutation,
} from './mutationRetryQueue';

export interface OfflineMutationQueue {
  enqueue(mutation: RetryableMutation): MutationQueueOutcome;
  flush(): void;
  pendingCount: number;
  queue: MutationRetryQueue;
}

export function useMutationRetryQueue(
  options: MutationRetryQueueOptions = {}
): OfflineMutationQueue {
  const [queue] = useState(() => new MutationRetryQueue(options));
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((version) => version + 1), []);

  useEffect(
    () =>
      onlineManager.subscribe((online) => {
        if (online) {
          void queue.flush().then(refresh, refresh);
        }
      }),
    [queue, refresh]
  );

  const enqueue = useCallback(
    (mutation: RetryableMutation) => {
      const outcome = queue.enqueue(mutation);
      refresh();
      return outcome;
    },
    [queue, refresh]
  );

  const flush = useCallback(() => {
    void queue.flush().then(refresh, refresh);
  }, [queue, refresh]);

  return { enqueue, flush, pendingCount: queue.pendingCount, queue };
}
