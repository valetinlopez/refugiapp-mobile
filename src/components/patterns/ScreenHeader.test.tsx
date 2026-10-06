import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ScreenHeader } from './ScreenHeader';

function ScreenHeaderTestAction() {
  return <Text testID="screen-header-action">Nueva tarea</Text>;
}

describe('ScreenHeader (RFG-136)', () => {
  it('announces the title as the screen heading with its subtitle', async () => {
    const screen = await render(<ScreenHeader subtitle="Resumen operativo" title="Cuidados" />);

    expect(screen.getByText('Cuidados').props.accessibilityRole).toBe('header');
    expect(screen.getByText('Resumen operativo')).toBeTruthy();
  });

  it('renders trailing actions when provided', async () => {
    const screen = await render(
      <ScreenHeader actions={<ScreenHeaderTestAction />} title="Cuidados" />
    );

    expect(screen.getByTestId('screen-header-action')).toBeTruthy();
  });
});
