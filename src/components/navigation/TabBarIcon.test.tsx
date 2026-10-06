import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { colors, sizes } from '@/theme';

import { TabBarIcon } from './TabBarIcon';

type ContainerStyle = {
  backgroundColor?: string;
  minHeight?: number;
  minWidth?: number;
};

function flattenStyle(style: unknown): ContainerStyle {
  return StyleSheet.flatten(style as ContainerStyle) as ContainerStyle;
}

describe('TabBarIcon', () => {
  it('shows a filled indicator surface when the destination is active', async () => {
    const screen = await render(<TabBarIcon focused name="calendar" />);
    const container = screen.getByTestId('tab-bar-icon-calendar');

    expect(flattenStyle(container.props.style).backgroundColor).toBe(colors.surfaceElevated);
  });

  it('keeps the layout footprint without an active surface when inactive', async () => {
    const screen = await render(<TabBarIcon focused={false} name="home" />);
    const style = flattenStyle(screen.getByTestId('tab-bar-icon-home').props.style);

    expect(style.backgroundColor).toBeUndefined();
    expect(style.minHeight).toBe(sizes.iconLg);
    expect(style.minWidth).toBe(sizes.touchTarget);
  });

  it('does not expose the decorative icon as an accessible image', async () => {
    const screen = await render(<TabBarIcon focused name="paw" />);

    expect(screen.queryByRole('image')).toBeNull();
  });
});
