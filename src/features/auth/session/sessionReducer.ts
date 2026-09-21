import type { User } from '../types';

export type SessionState =
  | { status: 'restoring'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null };

export type SessionAction =
  { type: 'authenticated'; user: User } | { type: 'unauthenticated' } | { type: 'restoring' };

export const initialSessionState: SessionState = { status: 'restoring', user: null };

export function sessionReducer(_state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'authenticated':
      return { status: 'authenticated', user: action.user };
    case 'unauthenticated':
      return { status: 'unauthenticated', user: null };
    case 'restoring':
      return initialSessionState;
  }
}
