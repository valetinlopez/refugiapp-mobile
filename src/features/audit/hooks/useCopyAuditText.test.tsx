import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useCopyAuditText } from './useCopyAuditText';

jest.mock('expo-clipboard', () => ({
  __esModule: true,
  setStringAsync: jest.fn(),
}));

const Clipboard = jest.requireMock('expo-clipboard') as { setStringAsync: jest.Mock };

describe('useCopyAuditText', () => {
  let announceSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    announceSpy.mockRestore();
    jest.useRealTimers();
  });

  it('copies, announces success and exposes the copied key', async () => {
    Clipboard.setStringAsync.mockResolvedValue(true);
    const { result } = await renderHook(() => useCopyAuditText());

    await act(async () => {
      result.current.copy('uuid-value', 'Identificador copiado.', 'key-1');
    });

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('uuid-value');
    expect(announceSpy).toHaveBeenCalledWith('Identificador copiado.');
    expect(result.current.copiedKey).toBe('key-1');
    expect(result.current.errorKey).toBeNull();
  });

  it('announces a safe message and exposes the failing key on error', async () => {
    Clipboard.setStringAsync.mockRejectedValue(new Error('nope'));
    const { result } = await renderHook(() => useCopyAuditText());

    await act(async () => {
      result.current.copy('uuid-value', 'Identificador copiado.', 'key-1');
    });

    expect(announceSpy).toHaveBeenCalledWith('No pudimos copiar. Intentá nuevamente.');
    expect(result.current.errorKey).toBe('key-1');
    expect(result.current.copiedKey).toBeNull();
  });

  it('clears the feedback after the delay', async () => {
    Clipboard.setStringAsync.mockResolvedValue(true);
    const { result } = await renderHook(() => useCopyAuditText());

    await act(async () => {
      result.current.copy('uuid-value', 'Identificador copiado.', 'key-1');
    });
    expect(result.current.copiedKey).toBe('key-1');

    await act(async () => {
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    expect(result.current.copiedKey).toBeNull();
    expect(result.current.errorKey).toBeNull();
  });
});
