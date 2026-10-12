import { render } from '@testing-library/react-native';

import { REFERENCE_CASES } from './referenceCases';
import { ReferenceValidationSection } from './components/ReferenceValidationSection';
import { referenceStatesTestId } from './testUtils';
import { REFERENCE_STATES, REFERENCE_STATE_LABELS } from './types';

describe('regression state previews (RFG-167)', () => {
  it('covers the six presentation states for every one of the 25 cases', async () => {
    const screen = await render(<ReferenceValidationSection />);

    const stateTestIds = screen.getAllByTestId(
      /^ds-case-D06-\d{2}-(default|loading|empty|error|offline|restricted)$/
    );
    expect(stateTestIds).toHaveLength(REFERENCE_CASES.length * REFERENCE_STATES.length);
    expect(screen.getAllByTestId(/^ds-case-preview-D06-\d{2}$/)).toHaveLength(
      REFERENCE_CASES.length
    );
  });

  it('renders exactly one block per state for each case', async () => {
    const screen = await render(<ReferenceValidationSection />);

    REFERENCE_STATES.forEach((state) => {
      const perState = screen.getAllByTestId(new RegExp(`^ds-case-D06-\\d{2}-${state}$`));
      expect(perState).toHaveLength(REFERENCE_CASES.length);
    });
  });

  it('announces every state with text, not color alone', async () => {
    const screen = await render(<ReferenceValidationSection />);

    REFERENCE_STATES.forEach((state) => {
      const label = REFERENCE_STATE_LABELS[state];
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(REFERENCE_CASES.length);
    });
    expect(screen.getAllByText('Sin resultados').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Algo salió mal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sin conexión').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sin permiso').length).toBeGreaterThanOrEqual(1);
  });
});

describe('referenceStatesTestId helper', () => {
  it('builds the stable RFG-167 selector per state block', () => {
    expect(referenceStatesTestId('D06-24', 'offline')).toBe('ds-case-D06-24-offline');
    expect(referenceStatesTestId('D06-25', 'default')).toBe('ds-case-D06-25-default');
  });
});
