import { createContext, type PropsWithChildren } from 'react';

import { tokens, type Theme } from './tokens';

export const ThemeContext = createContext<Theme>(tokens);

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}
