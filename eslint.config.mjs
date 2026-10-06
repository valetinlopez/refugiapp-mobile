import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default defineConfig([
  expoConfig,
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      // React Native usa Pressable (onPress) en lugar del modelo click/teclado web.
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/mouse-events-have-key-events': 'off',
      // El foco inicial en modales se gestiona por plataforma; se audita manual.
      'jsx-a11y/no-autofocus': 'off',
      // Metro resuelve assets por base name (@1x/@2x/@3x) sin archivo literal;
      // la regla de imports no debe marcar esos requires.
      'import/no-unresolved': [
        'error',
        {
          ignore: ['\\.(webp|png|jpe?g|gif|ttf|otf)$'],
        },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'coverage/**',
      'expo-env.d.ts',
      '*.tsbuildinfo',
    ],
  },
]);
