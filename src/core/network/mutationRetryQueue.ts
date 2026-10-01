export interface RetryableMutation {
  readonly key: string;
  readonly safeToRetry: boolean;
  run(): Promise<unknown>;
}

export type MutationQueueOutcome = 'queued' | 'duplicate' | 'rejected-unsafe' | 'rejected-full';

export interface MutationRetryQueueOptions {
  readonly baseDelayMs?: number;
  readonly maxAttempts?: number;
  readonly maxDelayMs?: number;
  readonly maxSize?: number;
  readonly now?: () => number;
  readonly onExhausted?: (mutation: RetryableMutation) => void;
  readonly random?: () => number;
}

interface QueueEntry {
  attempts: number;
  mutation: RetryableMutation;
  nextAttemptAt: number;
}

const DEFAULT_BASE_DELAY_MS = 1000;
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_MAX_DELAY_MS = 30000;
const DEFAULT_MAX_SIZE = 20;

export class MutationRetryQueue {
  private readonly baseDelayMs: number;
  private readonly entries: QueueEntry[] = [];
  private flushing = false;
  private readonly maxAttempts: number;
  private readonly maxDelayMs: number;
  private readonly maxSize: number;
  private readonly now: () => number;
  private readonly onExhausted?: ((mutation: RetryableMutation) => void) | undefined;
  private readonly random: () => number;

  constructor(options: MutationRetryQueueOptions = {}) {
    this.baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
    this.maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    this.maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
    this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
    this.now = options.now ?? Date.now;
    this.onExhausted = options.onExhausted;
    this.random = options.random ?? Math.random;
  }

  get pendingCount(): number {
    return this.entries.length;
  }

  get pendingKeys(): string[] {
    return this.entries.map((entry) => entry.mutation.key);
  }

  enqueue(mutation: RetryableMutation): MutationQueueOutcome {
    if (!mutation.safeToRetry) {
      return 'rejected-unsafe';
    }
    if (this.entries.some((entry) => entry.mutation.key === mutation.key)) {
      return 'duplicate';
    }
    if (this.entries.length >= this.maxSize) {
      return 'rejected-full';
    }
    this.entries.push({ attempts: 0, mutation, nextAttemptAt: this.now() });
    return 'queued';
  }

  msUntilNextDue(): number | null {
    if (this.entries.length === 0) {
      return null;
    }
    const upcoming = Math.min(...this.entries.map((entry) => entry.nextAttemptAt));
    return Math.max(0, upcoming - this.now());
  }

  async flush(): Promise<void> {
    if (this.flushing) {
      return;
    }
    this.flushing = true;
    try {
      const now = this.now();
      const due = this.entries.filter((entry) => entry.nextAttemptAt <= now);
      for (const entry of due) {
        await this.attempt(entry);
      }
    } finally {
      this.flushing = false;
    }
  }

  private async attempt(entry: QueueEntry): Promise<void> {
    try {
      await entry.mutation.run();
      this.remove(entry);
    } catch {
      entry.attempts += 1;
      if (entry.attempts >= this.maxAttempts) {
        this.remove(entry);
        this.onExhausted?.(entry.mutation);
      } else {
        entry.nextAttemptAt = this.now() + this.retryDelayMs(entry.attempts);
      }
    }
  }

  private remove(entry: QueueEntry): void {
    const index = this.entries.indexOf(entry);
    if (index >= 0) {
      this.entries.splice(index, 1);
    }
  }

  private retryDelayMs(attempt: number): number {
    const exponential = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** (attempt - 1));
    return exponential / 2 + this.random() * (exponential / 2);
  }
}
