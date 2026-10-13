import { renderHook } from '@testing-library/react-native';

import { sizes, spacing } from '@/theme';

import {
  resolveTabBarContentPaddingBottom,
  useTabBarContentPadding,
} from './useTabBarContentPadding';

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: jest.fn(),
  };
});

const { useSafeAreaInsets } = jest.requireMock('react-native-safe-area-context') as {
  useSafeAreaInsets: jest.Mock;
};

describe('resolveTabBarContentPaddingBottom', () => {
  it('adds bar height, curve, inset and margin from theme tokens', () => {
    expect(resolveTabBarContentPaddingBottom(34)).toBe(
      sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + 34 + spacing.lg
    );
  });

  it('respects a custom trailing margin for FAB lists', () => {
    expect(resolveTabBarContentPaddingBottom(21, sizes.fab + spacing.lg)).toBe(
      sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + 21 + sizes.fab + spacing.lg
    );
  });

  it('keeps content above the bar when there is no inset', () => {
    expect(resolveTabBarContentPaddingBottom(0)).toBe(
      sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + spacing.lg
    );
  });
});

describe('useTabBarContentPadding', () => {
  it('reads the live bottom inset so notch and gesture bars are covered', async () => {
    useSafeAreaInsets.mockReturnValue({ bottom: 34, left: 0, right: 0, top: 0 });
    const { result } = await renderHook(() => useTabBarContentPadding());

    expect(result.current).toBe(
      sizes.bottomNavigationHeight + sizes.bottomNavigationCurve + 34 + spacing.lg
    );
  });
});
