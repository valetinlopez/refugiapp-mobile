import { fireEvent, render, type RenderResult } from '@testing-library/react-native';

import { DecorativeImage } from './DecorativeImage';

const PRIMARY = { uri: 'file:///hero.webp' };
const FALLBACK = { uri: 'file:///hero.png' };

/** expo-image exposes the source as an array on the native host. */
function sourceProp(screen: RenderResult) {
  return screen.getByTestId('decorative-image', { includeHiddenElements: true }).props.source as {
    uri: string;
  }[];
}

describe('DecorativeImage (RFG-135)', () => {
  it('hides a decorative image from assistive technologies by default', async () => {
    const screen = await render(<DecorativeImage source={PRIMARY} testID="decorative-image" />);

    const image = screen.getByTestId('decorative-image', { includeHiddenElements: true });
    expect(image.props.accessible).toBe(false);
    expect(image.props.accessibilityElementsHidden).toBe(true);
    expect(image.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(image.props.accessibilityLabel).toBe('');
    expect(screen.queryByLabelText(/perro/i)).toBeNull();
  });

  it('hides decorative images from default RNTL queries (a11y contract)', async () => {
    const screen = await render(<DecorativeImage source={PRIMARY} testID="decorative-image" />);

    expect(screen.queryByTestId('decorative-image')).toBeNull();
    expect(
      screen.queryByTestId('decorative-image', { includeHiddenElements: true })
    ).not.toBeNull();
  });

  it('exposes an accessible, informative image when an accessibility label is provided', async () => {
    const screen = await render(
      <DecorativeImage
        accessibilityLabel="Perro rescatado de Refugiapp"
        source={PRIMARY}
        testID="decorative-image"
      />
    );

    const image = screen.getByTestId('decorative-image');
    expect(image.props.accessible).toBe(true);
    expect(image.props.accessibilityLabel).toBe('Perro rescatado de Refugiapp');
    expect(screen.getByLabelText('Perro rescatado de Refugiapp')).toBeTruthy();
  });

  it('swaps to the PNG fallback only when the primary fails to decode', async () => {
    const screen = await render(
      <DecorativeImage fallbackSource={FALLBACK} source={PRIMARY} testID="decorative-image" />
    );

    expect(sourceProp(screen)).toEqual([PRIMARY]);

    await fireEvent(
      screen.getByTestId('decorative-image', { includeHiddenElements: true }),
      'onError',
      { nativeEvent: { error: 'mock-decode-error' } }
    );

    expect(sourceProp(screen)).toEqual([FALLBACK]);
  });

  it('stays on the primary source when it fails and there is no fallback', async () => {
    const screen = await render(<DecorativeImage source={PRIMARY} testID="decorative-image" />);

    await fireEvent(
      screen.getByTestId('decorative-image', { includeHiddenElements: true }),
      'onError',
      { nativeEvent: { error: 'mock-decode-error' } }
    );

    expect(sourceProp(screen)).toEqual([PRIMARY]);
  });

  it('resets the fallback state when the primary source changes', async () => {
    const screen = await render(
      <DecorativeImage fallbackSource={FALLBACK} source={PRIMARY} testID="decorative-image" />
    );

    await fireEvent(
      screen.getByTestId('decorative-image', { includeHiddenElements: true }),
      'onError',
      { nativeEvent: { error: 'mock-decode-error' } }
    );
    expect(sourceProp(screen)).toEqual([FALLBACK]);

    const NEXT = { uri: 'file:///hero-2.webp' };
    await screen.rerender(
      <DecorativeImage fallbackSource={FALLBACK} source={NEXT} testID="decorative-image" />
    );

    expect(sourceProp(screen)).toEqual([NEXT]);
  });

  it('delegates decoding to expo-image with memory-disk cache and downscaling', async () => {
    const screen = await render(<DecorativeImage source={PRIMARY} testID="decorative-image" />);

    const image = screen.getByTestId('decorative-image', { includeHiddenElements: true });
    expect(image.props.cachePolicy).toBe('memory-disk');
    expect(image.props.allowDownscaling).toBe(true);
    expect(image.props.contentFit).toBe('contain');
  });

  it('reserves the aspect ratio to avoid layout shift', async () => {
    const screen = await render(
      <DecorativeImage aspectRatio={1} source={PRIMARY} testID="decorative-image" />
    );

    const image = screen.getByTestId('decorative-image', { includeHiddenElements: true });
    expect(image.props.style).toMatchObject({ aspectRatio: 1 });
  });
});
