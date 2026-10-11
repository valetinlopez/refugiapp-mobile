import { render } from '@testing-library/react-native';

import { REFERENCE_CASES } from '../referenceCases';
import { ReferenceValidationSection } from './ReferenceValidationSection';

describe('ReferenceValidationSection (D06 / RFG-139)', () => {
  it('renders a reproducible case and preview for all 25 references', async () => {
    const screen = await render(<ReferenceValidationSection />);

    expect(screen.getByTestId('ds-reference-validation')).toBeTruthy();
    expect(screen.getAllByTestId(/^ds-case-D06-\d{2}$/)).toHaveLength(REFERENCE_CASES.length);
    expect(screen.getAllByTestId(/^ds-case-preview-D06-\d{2}$/)).toHaveLength(
      REFERENCE_CASES.length
    );
  }, 20000);
});
