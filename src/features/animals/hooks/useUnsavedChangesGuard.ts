import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UnsavedChangesGuard {
  /** Allow the next removal without prompting (used after a successful save). */
  bypassNextRemoval(): void;
  cancelDiscard(): void;
  confirmDiscard(): void;
  discardVisible: boolean;
}

/**
 * Guards a stack screen against losing an unsaved draft (D16 / RFG-149).
 *
 * When `when` is true it intercepts the navigation removal triggered by the
 * header back button, the hardware back button or `navigateBack`, prevents it
 * and surfaces a confirmation dialog. Confirming replays the original action;
 * cancelling keeps the user on the screen. Call `bypassNextRemoval` before an
 * intentional leave (e.g. after a successful save) so it is not intercepted.
 */
export function useUnsavedChangesGuard(when: boolean, onFallback: () => void): UnsavedChangesGuard {
  const navigation = useNavigation();
  const [discardVisible, setDiscardVisible] = useState(false);
  const bypassGuard = useRef(false);
  const pendingAction = useRef<Parameters<typeof navigation.dispatch>[0] | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (bypassGuard.current || !when) {
        return;
      }
      event.preventDefault();
      pendingAction.current = event.data.action;
      setDiscardVisible(true);
    });
    return unsubscribe;
  }, [navigation, when]);

  const confirmDiscard = useCallback(() => {
    bypassGuard.current = true;
    setDiscardVisible(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) {
      navigation.dispatch(action);
    } else {
      onFallback();
    }
  }, [navigation, onFallback]);

  const cancelDiscard = useCallback(() => {
    pendingAction.current = null;
    setDiscardVisible(false);
  }, []);

  const bypassNextRemoval = useCallback(() => {
    bypassGuard.current = true;
  }, []);

  return { bypassNextRemoval, cancelDiscard, confirmDiscard, discardVisible };
}
