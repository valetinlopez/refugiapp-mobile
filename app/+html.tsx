import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

import { colors } from '@/theme';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: globalWebStyles }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalWebStyles = `
body {
  background-color: ${colors.background};
}

input[data-testid='login-email']:-webkit-autofill,
input[data-testid='login-email']:-webkit-autofill:hover,
input[data-testid='login-email']:-webkit-autofill:focus,
input[data-testid='login-password']:-webkit-autofill,
input[data-testid='login-password']:-webkit-autofill:hover,
input[data-testid='login-password']:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px ${colors.surface} inset !important;
  box-shadow: 0 0 0 1000px ${colors.surface} inset !important;
  -webkit-text-fill-color: ${colors.textPrimary} !important;
  caret-color: ${colors.textPrimary};
  border-color: ${colors.border};
}

input[data-testid='login-email']:focus,
input[data-testid='login-password']:focus {
  border-color: ${colors.focus} !important;
  outline: 2px solid ${colors.focus};
  outline-offset: 0;
}`;
