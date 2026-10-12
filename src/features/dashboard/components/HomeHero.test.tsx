import { render } from '@testing-library/react-native';

import { AppText } from '@/components/primitives';

import { HomeHero } from './HomeHero';

describe('HomeHero (D38.3 / RFG-174)', () => {
  it('renders the native copy over the scrim band', async () => {
    const screen = await render(
      <HomeHero>
        <AppText>Buenas tardes, Andrés</AppText>
      </HomeHero>
    );

    expect(screen.getByText('Buenas tardes, Andrés')).toBeTruthy();
    expect(screen.getByTestId('home-hero')).toBeTruthy();
  });

  it('hides the decorative photograph from assistive technologies', async () => {
    const screen = await render(
      <HomeHero>
        <AppText>Saludo</AppText>
      </HomeHero>
    );

    const image = screen.getByTestId('home-hero-image', { includeHiddenElements: true });
    expect(image.props.accessible).toBe(false);
    expect(image.props.accessibilityElementsHidden).toBe(true);
    expect(image.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(image.props.accessibilityLabel).toBe('');
  });

  it('keeps the decorative image invisible to default RNTL queries', async () => {
    const screen = await render(
      <HomeHero>
        <AppText>Saludo</AppText>
      </HomeHero>
    );

    expect(screen.queryByTestId('home-hero-image')).toBeNull();
    expect(screen.queryByTestId('home-hero-image', { includeHiddenElements: true })).not.toBeNull();
  });

  it('draws a local scrim band under the copy for contrast', async () => {
    const screen = await render(
      <HomeHero>
        <AppText>Saludo</AppText>
      </HomeHero>
    );

    expect(screen.getByTestId('home-hero-scrim')).toBeTruthy();
  });
});
