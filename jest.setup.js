const { jest } = require('@jest/globals');

jest.mock('expo-symbols', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    SymbolView: ({ name: _name, ...props }) => React.createElement(Text, props, 'icon'),
  };
});
