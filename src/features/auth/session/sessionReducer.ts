import type { User } from '../types';

export type SessionState =
  | { status: 'restoring'; user: null; notice: null }
  | { status: 'authenticated'; user: User; notice: null }
  | { status: 'unauthenticated'; user: null; notice: string | null };

export type SessionAction =
  | { type: 'authenticated'; user: User }
  | { type: 'unauthenticated'; notice?: string | null }
  | { type: 'restoring' };

export const initialSessionState: SessionState = { status: 'restoring', user: null, notice: null };

export function sessionReducer(_state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'authenticated':
      return { status: 'authenticated', user: action.user, notice: null };
    case 'unauthenticated':
      return { status: 'unauthenticated', user: null, notice: action.notice ?? null };
    case 'restoring':
      return initialSessionState;
  }
}
