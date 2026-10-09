import { render } from '@testing-library/react-native';

import { useCapabilities } from '@/features/auth/hooks/useCapabilities';
import { MedicalRecordDetailScreen } from '@/features/medical-records/components/MedicalRecordDetailScreen';

import MedicalRecordDetailRoute from '../[id]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({
    id: '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14',
  })),
}));
jest.mock('@/features/auth/hooks/useCapabilities', () => ({ useCapabilities: jest.fn() }));
jest.mock('@/features/auth/components/AccountHeaderRow', () => ({
  AccountHeaderRow: () => null,
}));
jest.mock('@/features/medical-records/components/MedicalRecordDetailScreen', () => ({
  MedicalRecordDetailScreen: jest.fn(({ recordId }: { recordId: string }) => {
    const React = jest.requireActual('react');
    const { Text } = jest.requireActual('react-native');
    return React.createElement(Text, null, `Detalle ${recordId}`);
  }),
}));

const mockCapabilities = useCapabilities as jest.Mock;
const mockDetail = MedicalRecordDetailScreen as jest.Mock;

describe('MedicalRecordDetailRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCapabilities.mockReturnValue({ canReadClinicalRecords: true });
  });

  it('validates the route id and delegates to the feature screen', async () => {
    const screen = await render(<MedicalRecordDetailRoute />);

    expect(screen.getByText(/Detalle 0e2a3b4c/)).toBeTruthy();
    expect(mockDetail.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ recordId: '0e2a3b4c-5d6e-4f80-9a10-b11c12d13e14' })
    );
  });

  it('does not mount the clinical detail after permission loss', async () => {
    mockCapabilities.mockReturnValue({ canReadClinicalRecords: false });

    const screen = await render(<MedicalRecordDetailRoute />);

    expect(screen.getByText('Sin permiso')).toBeTruthy();
    expect(mockDetail).not.toHaveBeenCalled();
  });
});
