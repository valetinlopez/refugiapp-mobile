import { render } from '@testing-library/react-native';

import { DecorativeBackground } from './DecorativeBackground';

describe('DecorativeBackground (RFG-136)', () => {
  it('renders the hero artwork hidden from assistive technologies', async () => {
    const screen = await render(<DecorativeBackground testID="ds-bg" variant="hero" />);

    const layer = screen.getByTestId('ds-bg', { includeHiddenElements: true });
    expect(layer.props.accessible).toBe(false);
    expect(layer.props.accessibilityElementsHidden).toBe(true);
    expect(layer.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('stays invisible to default RNTL queries (decorative a11y contract)', async () => {
    const screen = await render(<DecorativeBackground testID="ds-bg" variant="texture" />);

    expect(screen.queryByTestId('ds-bg')).toBeNull();
  });

  it('renders nothing when the variant is none', async () => {
    const screen = await render(<DecorativeBackground testID="ds-bg" variant="none" />);

    expect(screen.queryByTestId('ds-bg', { includeHiddenElements: true })).toBeNull();
  });
});
