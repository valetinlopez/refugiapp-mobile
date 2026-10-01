import {
  MutationRetryQueue,
  type MutationQueueOutcome,
  type RetryableMutation,
} from './mutationRetryQueue';

function mutation(key: string, run: () => Promise<unknown>): RetryableMutation {
  return { key, run, safeToRetry: true };
}

function controllableClock(start = 0) {
  let now = start;
  return {
    advance(ms: number): void {
      now += ms;
    },
    now(): number {
      return now;
    },
  };
}

describe('MutationRetryQueue', () => {
  it('runs a queued mutation on flush and removes it on success', async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    const queue = new MutationRetryQueue();

    expect(queue.enqueue(mutation('task-complete:1', run))).toBe('queued');
    expect(queue.pendingCount).toBe(1);

    await queue.flush();

    expect(run).toHaveBeenCalledTimes(1);
    expect(queue.pendingCount).toBe(0);
  });

  it('rejects unsafe mutations so non-idempotent work is never retried', () => {
    const queue = new MutationRetryQueue();
    const outcome: MutationQueueOutcome = queue.enqueue({
      key: 'expense-create:1',
      run: () => Promise.resolve(),
      safeToRetry: false,
    });

    expect(outcome).toBe('rejected-unsafe');
    expect(queue.pendingCount).toBe(0);
  });

  it('deduplicates by key and caps the queue size', () => {
    const queue = new MutationRetryQueue({ maxSize: 1 });
    const run = jest.fn().mockResolvedValue(undefined);

    expect(queue.enqueue(mutation('task-complete:1', run))).toBe('queued');
    expect(queue.enqueue(mutation('task-complete:1', run))).toBe('duplicate');
    expect(queue.enqueue(mutation('task-complete:2', run))).toBe('rejected-full');
    expect(queue.pendingKeys).toEqual(['task-complete:1']);
  });

  it('spaces attempts with exponential backoff and jitter', async () => {
    const clock = controllableClock();
    const run = jest.fn().mockRejectedValue(new Error('offline'));
    const queue = new MutationRetryQueue({
      baseDelayMs: 1000,
      maxAttempts: 5,
      maxDelayMs: 30000,
      now: () => clock.now(),
      random: () => 0,
    });
    queue.enqueue(mutation('task-complete:1', run));

    await queue.flush();
    expect(run).toHaveBeenCalledTimes(1);
    expect(queue.msUntilNextDue()).toBe(500);

    clock.advance(499);
    await queue.flush();
    expect(run).toHaveBeenCalledTimes(1);

    clock.advance(1);
    await queue.flush();
    expect(run).toHaveBeenCalledTimes(2);
    expect(queue.msUntilNextDue()).toBe(1000);
  });

  it('drops the mutation and reports it after exhausting attempts', async () => {
    const clock = controllableClock();
    const exhausted: string[] = [];
    const run = jest.fn().mockRejectedValue(new Error('offline'));
    const queue = new MutationRetryQueue({
      baseDelayMs: 1000,
      maxAttempts: 2,
      now: () => clock.now(),
      onExhausted: (failed) => {
        exhausted.push(failed.key);
      },
      random: () => 0,
    });
    queue.enqueue(mutation('task-complete:1', run));

    await queue.flush();
    clock.advance(500);
    await queue.flush();

    expect(run).toHaveBeenCalledTimes(2);
    expect(queue.pendingCount).toBe(0);
    expect(exhausted).toEqual(['task-complete:1']);
    expect(queue.msUntilNextDue()).toBeNull();
  });

  it('processes every due mutation in order on a single flush', async () => {
    const order: string[] = [];
    const queue = new MutationRetryQueue();
    queue.enqueue(
      mutation('first', async () => {
        order.push('first');
      })
    );
    queue.enqueue(
      mutation('second', async () => {
        order.push('second');
      })
    );

    await queue.flush();

    expect(order).toEqual(['first', 'second']);
    expect(queue.pendingCount).toBe(0);
  });
});
