function mockIcon(name: string) {
  return (props: Record<string, unknown>) =>
    require('react').createElement('Icon', { name, ...props });
}

jest.mock('lucide-react-native', () => ({
  CalendarDays: mockIcon('CalendarDays'),
  X: mockIcon('X'),
}));

jest.mock('@/context/AppContext', () => ({
  useApp: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: { onValueChange?: (...args: unknown[]) => void }) =>
      require('react').createElement(
        Text,
        {
          testID: 'date-time-picker',
          onValueChange: props.onValueChange,
        },
        'Date picker',
      ),
  };
});

import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import EditTransactionModal from '@/components/EditTransactionModal';
import { useApp } from '@/context/AppContext';
import type { Category, Transaction } from '@/types';

type AppContextValue = ReturnType<typeof useApp>;
const mockUseApp = useApp as jest.Mock;
const mockUpdateTransaction = jest.fn();
const mockOnClose = jest.fn();

const categories: Category[] = [
  { id: '10', name: 'Rent', type: 'EXPENSE' },
  { id: '20', name: 'Salary', type: 'INCOME' },
  { id: '30', name: 'Loan', type: 'LIABILITY' },
];

const transaction: Transaction = {
  id: 'tx-1',
  date: '2026-01-15',
  transactionDate: '2026-01-15',
  categoryId: '10',
  description: 'Rent payment',
  subDescription: 'January',
  category: 'Rent',
  amount: 5000,
  type: 'EXPENSE',
  addedBy: 'Admin',
};

const dateLabel = new Date(2026, 0, 15).toLocaleDateString('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

function renderModal() {
  return render(<EditTransactionModal transaction={transaction} onClose={mockOnClose} />);
}

describe('<EditTransactionModal />', () => {
  beforeEach(() => {
    mockUseApp.mockReset();
    mockUpdateTransaction.mockReset();
    mockOnClose.mockReset();
    mockUseApp.mockReturnValue({
      categories,
      updateTransaction: mockUpdateTransaction,
    } as unknown as AppContextValue);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the modal with the transaction values prefilled', async () => {
    const { getByText, getByDisplayValue } = await renderModal();

    expect(getByText('Edit Transaction')).toBeTruthy();
    expect(getByDisplayValue('Rent payment')).toBeTruthy();
    expect(getByDisplayValue('January')).toBeTruthy();
    expect(getByDisplayValue('5000')).toBeTruthy();
    expect(getByText('Rent')).toBeTruthy();
    expect(getByText(dateLabel)).toBeTruthy();
    expect(getByText('Save Changes')).toBeTruthy();
  });

  test('saves trimmed fields, numeric amount, lowercased type and formatted date', async () => {
    const { getByText, getByDisplayValue } = await renderModal();
    await fireEvent.changeText(getByDisplayValue('Rent payment'), '  Updated rent  ');
    await fireEvent.press(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUpdateTransaction).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-1', {
      description: 'Updated rent',
      remarks: 'January',
      category_id: 10,
      amount: 5000,
      type: 'expense',
      transaction_date: '2026-01-15',
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('rejects an empty description without calling updateTransaction', async () => {
    const { getByText, getByDisplayValue } = await renderModal();
    await fireEvent.changeText(getByDisplayValue('Rent payment'), '   ');
    await fireEvent.press(getByText('Save Changes'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Invalid transaction',
      'Enter a description, a positive amount, and choose a category.',
    );
    expect(mockUpdateTransaction).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('rejects a non-positive amount', async () => {
    const { getByText, getByDisplayValue } = await renderModal();
    await fireEvent.changeText(getByDisplayValue('5000'), '0');
    await fireEvent.press(getByText('Save Changes'));

    expect(mockUpdateTransaction).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Invalid transaction',
      'Enter a description, a positive amount, and choose a category.',
    );
  });

  test('changing type selects a matching category and saves the new type', async () => {
    const { getByText } = await renderModal();
    await fireEvent.press(getByText('INCOME'));

    await waitFor(() => expect(getByText('Salary')).toBeTruthy());
    await fireEvent.press(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUpdateTransaction).toHaveBeenCalledWith(
        'tx-1',
        expect.objectContaining({ type: 'income', category_id: 20 }),
      );
    });
  });

  test('surfaces an update failure and keeps the modal open', async () => {
    mockUpdateTransaction.mockRejectedValueOnce(new Error('Network down'));
    const { getByText } = await renderModal();
    await fireEvent.press(getByText('Save Changes'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Unable to update transaction', 'Network down');
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('closes when the close button is pressed', async () => {
    const { getByLabelText } = await renderModal();
    await fireEvent.press(getByLabelText('Close'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('opens the date picker and saves the newly selected date', async () => {
    const { getByText, getByTestId } = await renderModal();
    await fireEvent.press(getByText(dateLabel));

    const picker = getByTestId('date-time-picker');
    expect(picker).toBeTruthy();
    await fireEvent(picker, 'valueChange', {}, new Date(2026, 1, 20));

    await fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(mockUpdateTransaction).toHaveBeenCalledWith(
        'tx-1',
        expect.objectContaining({ transaction_date: '2026-02-20' }),
      );
    });
  });
});
