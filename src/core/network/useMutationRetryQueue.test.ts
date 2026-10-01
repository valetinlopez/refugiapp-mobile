import { onlineManager } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useMutationRetryQueue } from './useMutationRetryQueue';

describe('useMutationRetryQueue', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts empty and enqueues offline mutations', async () => {
    const { result } = await renderHook(() => useMutationRetryQueue());

    expect(result.current.pendingCount).toBe(0);

    let outcome: unknown;
    await act(() => {
      outcome = result.current.enqueue({
        key: 'care-task-complete:1',
        run: () => Promise.resolve(),
        safeToRetry: true,
      });
    });

    expect(outcome).toBe('queued');
    await waitFor(() => expect(result.current.pendingCount).toBe(1));
    expect(result.current.queue.pendingKeys).toEqual(['care-task-complete:1']);
  });

  it('flushes the queue on manual flush and clears pending count', async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    const { result } = await renderHook(() => useMutationRetryQueue());

    await act(() => {
      result.current.enqueue({ key: 'care-task-cancel:9', run, safeToRetry: true });
    });
    await waitFor(() => expect(result.current.pendingCount).toBe(1));

    await act(async () => {
      result.current.flush();
    });

    await waitFor(() => expect(result.current.pendingCount).toBe(0));
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('flushes automatically when onlineManager reports reconnection', async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    let listener: ((online: boolean) => void) | null = null;
    jest.spyOn(onlineManager, 'subscribe').mockImplementation((onOnline) => {
      listener = onOnline;
      return () => {
        listener = null;
      };
    });

    const { result, unmount } = await renderHook(() => useMutationRetryQueue());

    await act(() => {
      result.current.enqueue({ key: 'care-task-complete:7', run, safeToRetry: true });
    });
    await waitFor(() => expect(result.current.pendingCount).toBe(1));

    await act(async () => {
      listener?.(true);
    });

    await waitFor(() => expect(result.current.pendingCount).toBe(0));
    expect(run).toHaveBeenCalledTimes(1);

    unmount();
    expect(onlineManager.subscribe).toHaveBeenCalledTimes(1);
  });

  it('does not flush when onlineManager reports offline', async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    let listener: ((online: boolean) => void) | null = null;
    jest.spyOn(onlineManager, 'subscribe').mockImplementation((onOnline) => {
      listener = onOnline;
      return () => undefined;
    });

    const { result } = await renderHook(() => useMutationRetryQueue());

    await act(() => {
      result.current.enqueue({ key: 'care-task-complete:8', run, safeToRetry: true });
    });
    await waitFor(() => expect(result.current.pendingCount).toBe(1));

    await act(async () => {
      listener?.(false);
    });

    expect(run).not.toHaveBeenCalled();
    expect(result.current.pendingCount).toBe(1);
  });
});
