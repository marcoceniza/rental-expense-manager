(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useApp } from '@/context/AppContext';
import TransactionsScreen from '@/screens/TransactionsScreen';

jest.mock('@/context/AppContext', () => ({ useApp: jest.fn() }));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = (props: any) => ReactModule.createElement(View, null, props.children);
  const names = [
    'AlertCircle', 'CalendarDays', 'FileSpreadsheet', 'Pencil', 'Plus',
    'RotateCcw', 'Trash2', 'Search', 'X', 'User',
  ];
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

const loadMoreTransactions = jest.fn();
const resetTransactions = jest.fn();
const loadTrashedTransactions = jest.fn();
const restoreTransaction = jest.fn();
const permanentlyDeleteTransaction = jest.fn();
const deleteTransaction = jest.fn();
const addTransaction = jest.fn();

const categories = [
  { id: '1', name: 'Rent', type: 'INCOME' as const },
  { id: '2', name: 'Utilities', type: 'EXPENSE' as const },
  { id: '3', name: 'Donations', type: 'EXPENSE' as const, isCharity: true },
];

const adminUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  createdAt: '2026-01-01',
  role: 'Admin' as const,
};

const transactions = [
  {
    id: '1',
    date: 'Nov 5, 2026',
    transactionDate: '2026-11-05',
    categoryId: '1',
    description: 'Office Rent',
    subDescription: 'Monthly',
    category: 'Rent',
    amount: 15000,
    type: 'INCOME' as const,
    addedBy: 'Admin User',
  },
  {
    id: '2',
    date: 'Nov 6, 2026',
    transactionDate: '2026-11-06',
    categoryId: '2',
    description: 'Electricity Bill',
    category: 'Utilities',
    amount: 2000,
    type: 'EXPENSE' as const,
    addedBy: 'Admin User',
  },
  {
    id: '3',
    date: 'Nov 7, 2026',
    transactionDate: '2026-11-07',
    categoryId: '3',
    description: 'Charity Donation',
    category: 'Donations',
    amount: 500,
    type: 'EXPENSE' as const,
    addedBy: 'Admin User',
    isCharity: true,
  },
];

const trashedTransactions = [
  {
    id: '9',
    date: 'Oct 1, 2026',
    transactionDate: '2026-10-01',
    categoryId: '2',
    description: 'Old Bill',
    category: 'Utilities',
    amount: 300,
    type: 'EXPENSE' as const,
    addedBy: 'Admin User',
    deletedAt: '2026-10-10T00:00:00.000Z',
  },
];

const renderScreen = () => render(<TransactionsScreen />);

const setContext = (overrides: Partial<AppCtx> = {}) => {
  mockUseApp.mockReturnValue(asContext({
    transactions,
    transactionsLastPage: 2,
    loadMoreTransactions,
    resetTransactions,
    trashedTransactions,
    loadTrashedTransactions,
    restoreTransaction,
    permanentlyDeleteTransaction,
    deleteTransaction,
    addTransaction,
    categories,
    currentUser: adminUser,
    ...overrides,
  }));
};

describe('<TransactionsScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    loadMoreTransactions.mockResolvedValue(undefined);
    resetTransactions.mockResolvedValue(undefined);
    loadTrashedTransactions.mockResolvedValue(undefined);
    restoreTransaction.mockResolvedValue(undefined);
    permanentlyDeleteTransaction.mockResolvedValue(undefined);
    deleteTransaction.mockResolvedValue(undefined);
    addTransaction.mockResolvedValue(undefined);
    setContext();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the header, filtered totals, and non-charity transactions', async () => {
    const screen = await renderScreen();

    expect(screen.getByText('Transactions')).toBeTruthy();
    expect(screen.getByText('Manage all your financial records in one place.')).toBeTruthy();
    expect(screen.getByText('FILTERED TOTALS')).toBeTruthy();
    expect(screen.getByText('Showing 2 transactions')).toBeTruthy();
    expect(screen.getByText('Office Rent')).toBeTruthy();
    expect(screen.getByText('Electricity Bill')).toBeTruthy();
    expect(screen.queryByText('Charity Donation')).toBeNull();
    expect(screen.getByText('₱15,000.00')).toBeTruthy();
    expect(screen.getByText('Load More')).toBeTruthy();
    expect(resetTransactions).toHaveBeenCalled();
  });

  test('searching narrows the visible transactions', async () => {
    const screen = await renderScreen();

    await fireEvent.changeText(screen.getByPlaceholderText('Search transactions...'), 'Electric');

    expect(screen.getByText('Showing 1 transaction')).toBeTruthy();
    expect(screen.getByText('Electricity Bill')).toBeTruthy();
    expect(screen.queryByText('Office Rent')).toBeNull();
  });

  test('Load More asks the context for the next page', async () => {
    const screen = await renderScreen();

    await fireEvent.press(screen.getByText('Load More'));

    expect(loadMoreTransactions).toHaveBeenCalled();
  });

  test('opens the add modal and creates a transaction', async () => {
    setContext({ transactions: [], trashedTransactions: [] });
    const screen = await renderScreen();

    await fireEvent.press(screen.getByLabelText('Add transaction'));
    expect(screen.getByText('Add Transaction')).toBeTruthy();

    await fireEvent.changeText(
      screen.getByPlaceholderText('e.g. 1st Floor Rent or Solar Battery'),
      'New Bill',
    );
    await fireEvent.changeText(screen.getByPlaceholderText('0.00'), '500');
    await fireEvent.press(screen.getByText('Utilities'));
    await fireEvent.press(screen.getByText('Save'));

    expect(addTransaction).toHaveBeenCalledWith(expect.objectContaining({
      description: 'New Bill',
      category_id: 2,
      amount: 500,
      type: 'expense',
    }));
  });

  test('opens the trash bin and restores a deleted transaction', async () => {
    const screen = await renderScreen();

    await fireEvent.press(screen.getByLabelText(/Open Trash Bin/));

    await waitFor(() => expect(loadTrashedTransactions).toHaveBeenCalled());
    expect(screen.getByText('Trash Bin')).toBeTruthy();
    expect(screen.getByText('Old Bill')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Restore Old Bill'));
    await waitFor(() => expect(restoreTransaction).toHaveBeenCalledWith('9'));
  });

  test('asks for confirmation before deleting a transaction', async () => {
    const screen = await renderScreen();

    await fireEvent.press(screen.getByLabelText('Delete Office Rent'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete transaction?',
      'Office Rent will be deleted.',
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
