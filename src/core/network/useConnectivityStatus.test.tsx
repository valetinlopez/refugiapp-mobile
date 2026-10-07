import { onlineManager } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useConnectivityStatus } from './useConnectivityStatus';

describe('useConnectivityStatus', () => {
  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it('tracks online manager changes', async () => {
    onlineManager.setOnline(true);
    const { result } = await renderHook(() => useConnectivityStatus());

    expect(result.current).toBe(true);

    await act(() => onlineManager.setOnline(false));
    await waitFor(() => expect(result.current).toBe(false));

    await act(() => onlineManager.setOnline(true));
    await waitFor(() => expect(result.current).toBe(true));
  });
});
