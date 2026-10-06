import { render } from '@testing-library/react-native';

import { SectionHeader } from './SectionHeader';

describe('SectionHeader (RFG-136)', () => {
  it('announces the section title as a heading', async () => {
    const screen = await render(<SectionHeader subtitle="Eventos recientes" title="Historial" />);

    expect(screen.getByText('Historial').props.accessibilityRole).toBe('header');
    expect(screen.getByText('Eventos recientes')).toBeTruthy();
  });
});
