import { fireEvent, render } from '@testing-library/react-native';

import { AttachmentList } from './AttachmentList';

const attachments = [
  { id: 'a1', name: 'radiografia.jpg', sizeLabel: '1,2 MB', status: 'ready' as const },
  { id: 'a2', name: 'informe.pdf', sizeLabel: '840 KB', status: 'ready' as const },
];

describe('AttachmentList (RFG-136)', () => {
  it('explains an empty list without inventing an action', async () => {
    const screen = await render(<AttachmentList attachments={[]} />);

    expect(screen.getByText('Sin adjuntos')).toBeTruthy();
  });

  it('requires confirmation before removing an attachment', async () => {
    const onRemove = jest.fn();
    const screen = await render(<AttachmentList attachments={attachments} onRemove={onRemove} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Quitar radiografia.jpg' }));
    expect(onRemove).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('confirm-accept'));
    expect(onRemove).toHaveBeenCalledWith('a1');
  });

  it('keeps the attachment when the removal is cancelled', async () => {
    const onRemove = jest.fn();
    const screen = await render(<AttachmentList attachments={attachments} onRemove={onRemove} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Quitar radiografia.jpg' }));
    await fireEvent.press(screen.getByTestId('confirm-cancel'));

    expect(onRemove).not.toHaveBeenCalled();
  });
});
