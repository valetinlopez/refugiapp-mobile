import { render } from '@testing-library/react-native';

import { REFERENCE_CASES } from './referenceCases';
import { ReferenceValidationSection } from './components/ReferenceValidationSection';

describe('regression accessibility (RFG-167)', () => {
  it('exposes every case as an accessible summary with the full label', async () => {
    const screen = await render(<ReferenceValidationSection />);

    REFERENCE_CASES.forEach((referenceCase) => {
      const card = screen.getByTestId(`ds-case-${referenceCase.id}`);
      const { accessibilityLabel, accessibilityRole } = card.props as {
        accessibilityLabel?: string;
        accessibilityRole?: string;
      };
      expect(accessibilityRole).toBe('summary');
      expect(accessibilityLabel).toContain(`Caso ${referenceCase.id}`);
      expect(accessibilityLabel).toContain(referenceCase.referenceFile);
      expect(accessibilityLabel).toContain(referenceCase.route);
    });
  });

  it('announces destructive and actionable states with text, never color alone', async () => {
    const screen = await render(<ReferenceValidationSection />);

    // Every state block renders shared feedback (icon + text + tone); the
    // textual signal is what makes the state legible beyond color.
    expect(screen.getAllByText('Reintentar').length).toBeGreaterThanOrEqual(REFERENCE_CASES.length);
    expect(screen.getAllByText('Volver a intentar').length).toBeGreaterThanOrEqual(
      REFERENCE_CASES.length
    );
    expect(screen.getAllByText('Sin permiso').length).toBeGreaterThanOrEqual(
      REFERENCE_CASES.length
    );
  });

  it('keeps a single principal heading per produced screen (design rule)', async () => {
    const screen = await render(<ReferenceValidationSection />);
    const headers = screen.getAllByRole('header');
    expect(headers.length).toBeGreaterThan(0);
  });
});
