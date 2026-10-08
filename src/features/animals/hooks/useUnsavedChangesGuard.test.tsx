import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';

type BeforeRemoveHandler = (event: {
  data: { action: { type: string } };
  preventDefault(): void;
}) => void;

jest.mock('expo-router', () => {
  const listeners = new Map<string, BeforeRemoveHandler>();
  const navigation = {
    addListener: (type: string, handler: BeforeRemoveHandler) => {
      listeners.set(type, handler);
      return () => {
        listeners.delete(type);
      };
    },
    dispatch: jest.fn(),
    setOptions: jest.fn(),
  };
  return {
    __listeners: listeners,
    __navigation: navigation,
    useNavigation: () => navigation,
  };
});

const router = jest.requireMock('expo-router') as {
  __listeners: Map<string, BeforeRemoveHandler>;
  __navigation: { dispatch: jest.Mock };
};

function GuardProbe({ when, onFallback }: { when: boolean; onFallback: () => void }) {
  const guard = useUnsavedChangesGuard(when, onFallback);
  return (
    <View>
      <Text testID="discard-visible">{guard.discardVisible ? 'yes' : 'no'}</Text>
      <Pressable onPress={guard.confirmDiscard} testID="confirm">
        <Text>confirm</Text>
      </Pressable>
      <Pressable onPress={guard.cancelDiscard} testID="cancel">
        <Text>cancel</Text>
      </Pressable>
      <Pressable onPress={guard.bypassNextRemoval} testID="bypass">
        <Text>bypass</Text>
      </Pressable>
    </View>
  );
}

async function emitBeforeRemove(action: { type: string } = { type: 'POP' }): Promise<jest.Mock> {
  const preventDefault = jest.fn();
  await act(async () => {
    router.__listeners.get('beforeRemove')?.({ data: { action }, preventDefault });
  });
  return preventDefault;
}

describe('useUnsavedChangesGuard', () => {
  beforeEach(() => {
    router.__listeners.clear();
    router.__navigation.dispatch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not prevent removal when there are no pending changes', async () => {
    const screen = await render(<GuardProbe onFallback={() => undefined} when={false} />);

    const preventDefault = await emitBeforeRemove();

    expect(preventDefault).not.toHaveBeenCalled();
    expect(screen.getByTestId('discard-visible').props.children).toBe('no');
  });

  it('prevents removal and surfaces the confirmation when there are pending changes', async () => {
    const screen = await render(<GuardProbe onFallback={() => undefined} when />);

    const preventDefault = await emitBeforeRemove();

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('discard-visible').props.children).toBe('yes');
  });

  it('replays the prevented action when the user confirms discarding', async () => {
    const screen = await render(<GuardProbe onFallback={() => undefined} when />);
    const action = { type: 'POP' };
    await emitBeforeRemove(action);

    fireEvent.press(screen.getByTestId('confirm'));

    expect(router.__navigation.dispatch).toHaveBeenCalledWith(action);
    await waitFor(() => {
      expect(screen.getByTestId('discard-visible').props.children).toBe('no');
    });
  });

  it('stays on the screen when the user cancels discarding', async () => {
    const screen = await render(<GuardProbe onFallback={() => undefined} when />);
    await emitBeforeRemove();

    fireEvent.press(screen.getByTestId('cancel'));

    expect(router.__navigation.dispatch).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('discard-visible').props.children).toBe('no');
    });
  });

  it('skips the next interception after bypassNextRemoval', async () => {
    const screen = await render(<GuardProbe onFallback={() => undefined} when />);

    fireEvent.press(screen.getByTestId('bypass'));
    const preventDefault = await emitBeforeRemove();

    expect(preventDefault).not.toHaveBeenCalled();
    expect(screen.getByTestId('discard-visible').props.children).toBe('no');
  });
});
