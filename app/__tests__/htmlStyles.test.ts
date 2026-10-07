import { colors } from '@/theme';

import { globalWebStyles } from '../+html';

describe('global web form styles', () => {
  it('keeps create-user autofill and focus aligned with the theme', () => {
    expect(globalWebStyles).toContain("input[data-testid^='create-user-']:-webkit-autofill");
    expect(globalWebStyles).toContain("input[data-testid^='create-user-']:focus");
    expect(globalWebStyles).toContain(`-webkit-text-fill-color: ${colors.textPrimary}`);
    expect(globalWebStyles).toContain(`outline: 2px solid ${colors.focus}`);
  });
});
