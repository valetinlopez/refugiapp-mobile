import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { getReferenceCase } from '../referenceCases';
import { REFERENCE_VIEWPORTS } from '../viewports';
import { ReferenceCaseCard } from './ReferenceCaseCard';

function requireCase(id: string) {
  const referenceCase = getReferenceCase(id);
  if (referenceCase === undefined) {
    throw new Error(`Missing reference case ${id}`);
  }
  return referenceCase;
}

describe('ReferenceCaseCard (D06 / RFG-139)', () => {
  it('lists the reference metadata, states, divergences and viewports', async () => {
    const referenceCase = requireCase('D06-01');
    const screen = await render(
      <ReferenceCaseCard referenceCase={referenceCase}>
        <Text>preview</Text>
      </ReferenceCaseCard>
    );

    expect(screen.getByTestId('ds-case-D06-01')).toBeTruthy();
    expect(screen.getByText('01-login.jpeg')).toBeTruthy();
    expect(screen.getByText('app/(auth)/login.tsx')).toBeTruthy();
    expect(screen.getByText('preview')).toBeTruthy();
    REFERENCE_VIEWPORTS.forEach((viewport) => {
      expect(screen.getByText(viewport.label)).toBeTruthy();
    });
  });

  it('exposes an accessible summary label with id, route and audience', async () => {
    const referenceCase = requireCase('D06-06');
    const screen = await render(<ReferenceCaseCard referenceCase={referenceCase} />);

    const label = screen.getByTestId('ds-case-D06-06').props.accessibilityLabel as string;
    expect(label).toContain('Caso D06-06');
    expect(label).toContain('06-animal-status-change.jpeg');
    expect(label).toContain('canEditAnimal');
  });
});
