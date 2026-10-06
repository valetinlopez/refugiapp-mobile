import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { colors, fontFamilies } from '@/theme';

import { TabBarLabel } from './TabBarLabel';

type LabelStyle = {
  color?: string;
  fontFamily?: string;
};

function flattenStyle(style: unknown): LabelStyle {
  return StyleSheet.flatten(style as LabelStyle) as LabelStyle;
}

describe('TabBarLabel', () => {
  it('emphasizes the active destination with weight, not only color', async () => {
    const screen = await render(<TabBarLabel focused>Cuidados</TabBarLabel>);
    const style = flattenStyle(screen.getByText('Cuidados').props.style);

    expect(style.fontFamily).toBe(fontFamilies.bodyStrong);
    expect(style.color).toBe(colors.positive);
  });

  it('uses the regular weight for inactive destinations', async () => {
    const screen = await render(<TabBarLabel focused={false}>Cuidados</TabBarLabel>);
    const style = flattenStyle(screen.getByText('Cuidados').props.style);

    expect(style.fontFamily).toBe(fontFamilies.body);
    expect(style.color).toBe(colors.textSecondary);
  });

  it('truncates to a single line and allows font scaling', async () => {
    const screen = await render(<TabBarLabel focused={false}>Animales</TabBarLabel>);
    const label = screen.getByText('Animales');

    expect(label.props.numberOfLines).toBe(1);
    expect(label.props.allowFontScaling).toBe(true);
    expect(label.props.maxFontSizeMultiplier).toBe(1.8);
  });
});
