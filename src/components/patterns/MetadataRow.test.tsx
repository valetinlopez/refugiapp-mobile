import { render } from '@testing-library/react-native';

import { MetadataRow } from './MetadataRow';

describe('MetadataRow (RFG-136)', () => {
  it('exposes the label and formatted value as a summary', async () => {
    const screen = await render(<MetadataRow label="Ingreso" value="20/09/2026" />);

    const row = screen.getByLabelText('Ingreso: 20/09/2026');
    expect(row.props.accessibilityRole).toBe('summary');
    expect(screen.getByText('Ingreso')).toBeTruthy();
    expect(screen.getByText('20/09/2026')).toBeTruthy();
  });
});
