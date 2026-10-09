import { fireEvent, render } from '@testing-library/react-native';

import { ClinicalRecordTypeField } from './ClinicalRecordTypeField';

describe('ClinicalRecordTypeField', () => {
  it('changes the record type through the sheet', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <ClinicalRecordTypeField disabled={false} onChange={onChange} value="consultation" />
    );

    expect(screen.getByTestId('clinical-type-field')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('clinical-type-field'));
    await fireEvent.press(screen.getByTestId('clinical-type-option-vaccination'));

    expect(onChange).toHaveBeenCalledWith('vaccination');
  });

  it('marks the selected option in the sheet', async () => {
    const screen = await render(
      <ClinicalRecordTypeField disabled={false} onChange={() => undefined} value="vaccination" />
    );

    await fireEvent.press(screen.getByTestId('clinical-type-field'));

    expect(screen.getByRole('radio', { name: 'Vacunación' })).toBeTruthy();
  });
});
