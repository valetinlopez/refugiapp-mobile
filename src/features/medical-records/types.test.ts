import type { MediaAsset } from './types';
import { toClinicalAttachment } from './types';

describe('toClinicalAttachment', () => {
  it('keeps media metadata needed by the detail and derives a stable file name', () => {
    const dto: MediaAsset = {
      id: 'media-1',
      resourceType: 'image',
      publicId: 'refugiapp/medical-records/foto_control',
      secureUrl: 'https://cdn.test/foto_control.jpg',
      bytes: 2_400_000,
      format: 'jpg',
    };

    expect(toClinicalAttachment(dto)).toEqual({
      bytes: 2_400_000,
      format: 'jpg',
      id: 'media-1',
      name: 'foto_control.jpg',
      resourceType: 'image',
      secureUrl: 'https://cdn.test/foto_control.jpg',
    });
  });
});
