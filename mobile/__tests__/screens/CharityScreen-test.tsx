import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { useApp } from '@/context/AppContext';
import type { Transaction } from '@/types';
import CharityScreen from '@/screens/CharityScreen';

jest.mock('@/context/AppContext', () => ({
  useApp: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = () => ReactModule.createElement(View, null);
  return new Proxy(
    { __esModule: true },
    { get: (_target, prop) => (prop === '__esModule' ? true : Icon) },
  );
});

jest.mock('@react-native-community/datetimepicker', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => ReactModule.createElement(View, null),
  };
});

const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;
const fetchCharityTransactions = jest.fn<Promise<Transaction[]>, [number]>();
const deleteTransaction = jest.fn<Promise<void>, [string]>();

const transactions: Transaction[] = [
  {
    id: '10',
    date: 'Nov 1, 2026',
    transactionDate: '2026-11-01',
    categoryId: '1',
    description: 'School fees',
    subDescription: 'Tuition',
    category: 'Tuition',
    amount: 1500,
    type: 'EXPENSE',
    addedBy: 'Alice',
  },
  {
    id: '11',
    date: 'Nov 2, 2026',
    transactionDate: '2026-11-02',
    categoryId: '1',
    description: 'Books',
    category: 'Tuition',
    amount: 250,
    type: 'EXPENSE',
    addedBy: 'Bob',
  },
];

const setTransactions = (items: Transaction[]) => {
  fetchCharityTransactions.mockResolvedValue(items);
  mockUseApp.mockReturnValue({
    fetchCharityTransactions,
    deleteTransaction,
  } as unknown as ReturnType<typeof useApp>);
};

beforeEach(() => {
  jest.clearAllMocks();
  setTransactions(transactions);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('<CharityScreen />', () => {
  test('fetches and renders charity transactions with the total', async () => {
    const screen = await render(<CharityScreen />);

    expect(screen.getByText('Charity')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('School fees')).toBeTruthy();
      expect(screen.getByText('Books')).toBeTruthy();
    });
    expect(screen.getByText('Tuition Related Transactions (2)')).toBeTruthy();
    expect(screen.getByText(/TUITION & EDUCATIONAL SUPPORT TOTAL/)).toBeTruthy();
    expect(screen.getByText('-₱1,750.00')).toBeTruthy();
    expect(fetchCharityTransactions).toHaveBeenCalledWith(new Date().getFullYear());
  });

  test('asks for confirmation and deletes a transaction', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const screen = await render(<CharityScreen />);
    await waitFor(() => expect(screen.getByText('School fees')).toBeTruthy());

    await fireEvent.press(screen.getByLabelText('Delete School fees'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete transaction?',
      'School fees will be deleted.',
      expect.any(Array),
    );

    const buttons = alertSpy.mock.calls[0][2] as unknown as Array<{
      text: string;
      onPress?: () => void;
    }> | undefined;
    const deleteButton = buttons?.find((button) => button.text === 'Delete');
    expect(deleteButton).toBeDefined();
    await act(async () => {
      deleteButton?.onPress?.();
    });

    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledWith('10');
      expect(fetchCharityTransactions).toHaveBeenCalledTimes(2);
    });
  });

  test('renders an empty state when nothing is returned', async () => {
    setTransactions([]);
    const screen = await render(<CharityScreen />);

    await waitFor(() => {
      expect(
        screen.getByText('No tuition or charity transactions found for this year.'),
      ).toBeTruthy();
    });
    expect(screen.getByText('Tuition Related Transactions (0)')).toBeTruthy();
  });
});
