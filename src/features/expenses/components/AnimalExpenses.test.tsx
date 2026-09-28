import { render } from '@testing-library/react-native';

import { useAnimalExpenses } from '../hooks/useAnimalExpenses';
import { useExpenseReceipt } from '../hooks/useExpenseReceipt';
import { AnimalExpenses } from './AnimalExpenses';

jest.mock('../hooks/useAnimalExpenses', () => ({ useAnimalExpenses: jest.fn() }));
jest.mock('../hooks/useExpenseReceipt', () => ({ useExpenseReceipt: jest.fn() }));

const mockUseAnimalExpenses = useAnimalExpenses as jest.Mock;
const mockUseExpenseReceipt = useExpenseReceipt as jest.Mock;

describe('AnimalExpenses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpenseReceipt.mockReturnValue({ data: 'https://example.com/receipt.jpg' });
  });

  it('renders amount, category, date and receipt thumbnail', async () => {
    mockUseAnimalExpenses.mockReturnValue({
      data: {
        items: [
          {
            id: 'expense-1',
            animalId: 'animal-1',
            category: 'veterinary',
            amountCents: 123456,
            currency: 'ARS',
            description: 'Consulta anual',
            ticketMediaId: 'media-1',
            incurredAt: '2026-09-22T14:30:00.000Z',
          },
        ],
      },
      isError: false,
      isPending: false,
    });
    const screen = await render(<AnimalExpenses animalId="animal-1" />);
    expect(screen.getByText(/1\.234,56/)).toBeTruthy();
    expect(screen.getByText(/Veterinaria/)).toBeTruthy();
    expect(screen.getByLabelText('Comprobante del gasto')).toBeTruthy();
  });

  it('renders an explicit empty state', async () => {
    mockUseAnimalExpenses.mockReturnValue({
      data: { items: [] },
      isError: false,
      isPending: false,
    });
    const screen = await render(<AnimalExpenses animalId="animal-1" />);
    expect(screen.getByText('Sin gastos')).toBeTruthy();
  });
});
