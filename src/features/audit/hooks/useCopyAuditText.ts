import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { AUDIT_COPY_ERROR_ANNOUNCEMENT } from '../utils/auditPresentation';

const COPIED_FEEDBACK_MS = 2000;

export interface CopyAuditTextState {
  /** Key of the identifier copied most recently, cleared after a short delay. */
  copiedKey: string | null;
  /** Key of the identifier whose copy failed most recently, cleared after a short delay. */
  errorKey: string | null;
  copy: (text: string, announcement: string, key: string) => void;
}

/**
 * Accessible clipboard helper for audit identifiers (D33 / RFG-166).
 *
 * Wraps `expo-clipboard` so the detail screen never touches the native module
 * directly. On success it announces the result to assistive technologies and
 * exposes the copied key for inline visual feedback; on failure it announces a
 * safe message and exposes the failing key, never breaking the screen.
 * Identifiers only, never secrets.
 */
export function useCopyAuditText(): CopyAuditTextState {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeout.current !== null) clearTimeout(timeout.current);
    },
    []
  );

  const reset = useCallback(() => {
    if (timeout.current !== null) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setCopiedKey(null);
      setErrorKey(null);
    }, COPIED_FEEDBACK_MS);
  }, []);

  const copy = useCallback(
    (text: string, announcement: string, key: string) => {
      void Clipboard.setStringAsync(text)
        .then(() => {
          setErrorKey(null);
          setCopiedKey(key);
          AccessibilityInfo.announceForAccessibility(announcement);
          reset();
        })
        .catch(() => {
          setCopiedKey(null);
          setErrorKey(key);
          AccessibilityInfo.announceForAccessibility(AUDIT_COPY_ERROR_ANNOUNCEMENT);
          reset();
        });
    },
    [reset]
  );

  return { copiedKey, errorKey, copy };
}
