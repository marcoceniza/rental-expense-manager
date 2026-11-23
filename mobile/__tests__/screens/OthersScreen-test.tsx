(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useApp } from '@/context/AppContext';
import OthersScreen from '@/screens/OthersScreen';

jest.mock('@/context/AppContext', () => ({ useApp: jest.fn() }));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = (props: any) => ReactModule.createElement(View, null, props.children);
  const names = ['LayoutGrid', 'Pencil', 'Trash2', 'ChevronLeft', 'ChevronRight', 'User'];
  return Object.fromEntries(names.map((name) => [name, Icon]));
});

jest.mock('@react-native-community/datetimepicker', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => ReactModule.createElement(View, null, props.children),
  };
});

const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;
type AppCtx = ReturnType<typeof useApp>;
const asContext = (value: Partial<AppCtx>) => value as unknown as AppCtx;

const fetchOtherTransactions = jest.fn();
const deleteTransaction = jest.fn();

const otherTransaction = {
  id: '1',
  date: 'Nov 5, 2026',
  transactionDate: '2026-11-05',
  categoryId: '1',
  description: 'Gift to neighbor',
  subDescription: 'Thank you',
  category: 'Gifts',
  amount: 250,
  type: 'INCOME' as const,
  addedBy: 'Admin User',
  isOther: true,
};

describe('<OthersScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    fetchOtherTransactions.mockResolvedValue([otherTransaction]);
    deleteTransaction.mockResolvedValue(undefined);
    mockUseApp.mockReturnValue(asContext({ fetchOtherTransactions, deleteTransaction }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the header, yearly total, and loaded transactions', async () => {
    const screen = await render(<OthersScreen />);

    expect(screen.getByText('Others')).toBeTruthy();
    expect(screen.getByText('Monitor all transactions related to others.')).toBeTruthy();
    expect(screen.getByText('OTHER TRANSACTIONS TOTAL')).toBeTruthy();
    expect(screen.getByText(`Year ${new Date().getFullYear()}`)).toBeTruthy();

    await waitFor(() => expect(screen.getByText('Gift to neighbor')).toBeTruthy());
    expect(screen.getByText('Transactions (1)')).toBeTruthy();
    expect(screen.getAllByText('+₱250.00').length).toBeGreaterThan(0);
    expect(fetchOtherTransactions).toHaveBeenCalledWith(new Date().getFullYear());
  });

  test('shows the empty state when no transactions exist for the year', async () => {
    fetchOtherTransactions.mockResolvedValue([]);

    const screen = await render(<OthersScreen />);

    await waitFor(() =>
      expect(screen.getByText('No other transactions found for this year.')).toBeTruthy(),
    );
  });

  test('asks for confirmation before deleting a transaction', async () => {
    const screen = await render(<OthersScreen />);

    await waitFor(() => expect(screen.getByText('Gift to neighbor')).toBeTruthy());
    await fireEvent.press(screen.getByLabelText('Delete Gift to neighbor'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete transaction?',
      'Gift to neighbor will be deleted.',
      expect.any(Array),
    );

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const deleteButton = buttons.find((button: any) => button.text === 'Delete');
    await act(async () => {
      deleteButton.onPress();
    });
    expect(deleteTransaction).toHaveBeenCalledWith('1');
  });
});
