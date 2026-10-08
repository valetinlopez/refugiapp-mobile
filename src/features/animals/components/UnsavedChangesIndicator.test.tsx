import { render } from '@testing-library/react-native';

import { UnsavedChangesIndicator } from './UnsavedChangesIndicator';

describe('UnsavedChangesIndicator', () => {
  it('announces the unsaved draft with text and an accessible label', async () => {
    const screen = await render(<UnsavedChangesIndicator />);

    expect(screen.getByText('Cambios sin guardar')).toBeTruthy();
    expect(screen.getByLabelText('Cambios sin guardar')).toBeTruthy();
    expect(screen.getByTestId('edit-dirty-badge')).toBeTruthy();
  });
});
