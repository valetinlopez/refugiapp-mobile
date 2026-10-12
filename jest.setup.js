const { jest } = require('@jest/globals');

jest.mock('expo-symbols', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    SymbolView: ({ name: _name, ...props }) => React.createElement(Text, props, 'icon'),
  };
});

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
);

// First Reanimated usage in src (AnimalStatusBadge, D40 / RFG-176).
// The real module needs native worklets, unavailable in Jest, so every suite
// gets a static mock: Animated.View renders as a plain View (the `entering`
// prop is consumed, never passed through) and useReducedMotion defaults to
// false. Suites assert motion behavior through `FadeIn.duration` calls.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  function MockAnimatedView({ entering: _entering, ...rest }) {
    return React.createElement(View, rest);
  }

  return {
    __esModule: true,
    default: { View: MockAnimatedView },
    FadeIn: { duration: jest.fn((durationMs) => ({ animation: 'FadeIn', durationMs })) },
    useReducedMotion: jest.fn(() => false),
  };
});
