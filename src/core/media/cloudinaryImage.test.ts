import { optimizeCloudinaryImageUrl } from './cloudinaryImage';

describe('optimizeCloudinaryImageUrl', () => {
  it('adds context-sized automatic format and quality transformations to Cloudinary images', () => {
    expect(
      optimizeCloudinaryImageUrl(
        'https://res.cloudinary.com/refugiapp/image/upload/v123/animals/luna.jpg',
        { height: 180, width: 240 }
      )
    ).toBe(
      'https://res.cloudinary.com/refugiapp/image/upload/f_auto,q_auto,c_fill,g_auto,w_240,h_180/v123/animals/luna.jpg'
    );
  });

  it('keeps query strings and fragments intact', () => {
    expect(
      optimizeCloudinaryImageUrl(
        'https://res.cloudinary.com/refugiapp/image/upload/animals/luna.jpg?token=abc#photo',
        { width: 400 }
      )
    ).toBe(
      'https://res.cloudinary.com/refugiapp/image/upload/f_auto,q_auto,c_fill,g_auto,w_400,h_400/animals/luna.jpg?token=abc#photo'
    );
  });

  it('does not modify non-Cloudinary or non-image URLs', () => {
    expect(optimizeCloudinaryImageUrl('https://cdn.example.com/luna.jpg', { width: 400 })).toBe(
      'https://cdn.example.com/luna.jpg'
    );
    expect(
      optimizeCloudinaryImageUrl(
        'https://res.cloudinary.com/refugiapp/raw/upload/documents/receipt.pdf',
        { width: 400 }
      )
    ).toBe('https://res.cloudinary.com/refugiapp/raw/upload/documents/receipt.pdf');
  });

  it('is idempotent for the same transformation', () => {
    const optimized = optimizeCloudinaryImageUrl(
      'https://res.cloudinary.com/refugiapp/image/upload/animals/luna.jpg',
      { width: 144 }
    );

    expect(optimizeCloudinaryImageUrl(optimized, { width: 144 })).toBe(optimized);
  });
});
