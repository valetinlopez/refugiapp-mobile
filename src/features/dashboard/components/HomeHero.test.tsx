import { render } from '@testing-library/react-native';

import { HomeHero } from './HomeHero';

describe('HomeHero (D38.3 / RFG-174, header-first reorder)', () => {
  it('renders the full-bleed decorative photograph without children', async () => {
    const screen = await render(<HomeHero />);

    expect(screen.getByTestId('home-hero')).toBeTruthy();
    expect(screen.getByTestId('home-hero-image', { includeHiddenElements: true })).toBeTruthy();
  });

  it('hides the decorative photograph from assistive technologies', async () => {
    const screen = await render(<HomeHero />);

    const image = screen.getByTestId('home-hero-image', { includeHiddenElements: true });
    expect(image.props.accessible).toBe(false);
    expect(image.props.accessibilityElementsHidden).toBe(true);
    expect(image.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(image.props.accessibilityLabel).toBe('');
  });

  it('keeps the decorative image invisible to default RNTL queries', async () => {
    const screen = await render(<HomeHero />);

    expect(screen.queryByTestId('home-hero-image')).toBeNull();
    expect(screen.queryByTestId('home-hero-image', { includeHiddenElements: true })).not.toBeNull();
  });

  it('draws a bottom fade band that softens the photo-to-page edge', async () => {
    const screen = await render(<HomeHero />);

    expect(screen.getByTestId('home-hero-fade')).toBeTruthy();
  });
});
