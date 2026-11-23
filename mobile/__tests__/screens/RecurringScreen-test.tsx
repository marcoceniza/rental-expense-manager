(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useApp } from '@/context/AppContext';
import RecurringScreen from '@/screens/RecurringScreen';

jest.mock('@/context/AppContext', () => ({ useApp: jest.fn() }));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = (props: any) => ReactModule.createElement(View, null, props.children);
  const names = ['CalendarDays', 'Pencil', 'Plus', 'Repeat', 'Trash2', 'X'];
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

const addRecurring = jest.fn();
const updateRecurring = jest.fn();
const deleteRecurring = jest.fn();

const categories = [
  { id: '1', name: 'Rent', type: 'INCOME' as const },
  { id: '2', name: 'Utilities', type: 'EXPENSE' as const },
];

const recurringItem = {
  id: '1',
  title: 'Monthly Rent',
  categoryId: '1',
  category: 'Rent',
  amount: 12000,
  frequency: 'monthly' as const,
  startDate: '2026-01-01',
};

describe('<RecurringScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    addRecurring.mockResolvedValue(undefined);
    updateRecurring.mockResolvedValue(undefined);
    deleteRecurring.mockResolvedValue(undefined);
    mockUseApp.mockReturnValue(asContext({
      recurring: [recurringItem],
      categories,
      addRecurring,
      updateRecurring,
      deleteRecurring,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the header and each recurring transaction', async () => {
    const screen = await render(<RecurringScreen />);

    expect(screen.getByText('Recurring Transactions')).toBeTruthy();
    expect(screen.getByText('Automate your monthly income and expenses.')).toBeTruthy();
    expect(screen.getByText('Monthly Rent')).toBeTruthy();
    expect(screen.getByText('₱12,000.00')).toBeTruthy();
    expect(screen.getByText('monthly')).toBeTruthy();
  });

  test('shows the empty state when there are no recurring transactions', async () => {
    mockUseApp.mockReturnValue(asContext({
      recurring: [],
      categories,
      addRecurring,
      updateRecurring,
      deleteRecurring,
    }));

    const screen = await render(<RecurringScreen />);

    expect(screen.getByText('No recurring transactions yet. Add one to get started.')).toBeTruthy();
  });

  test('opens the create modal and saves a new recurring transaction', async () => {
    mockUseApp.mockReturnValue(asContext({
      recurring: [],
      categories,
      addRecurring,
      updateRecurring,
      deleteRecurring,
    }));

    const screen = await render(<RecurringScreen />);

    await fireEvent.press(screen.getByLabelText('Add recurring transaction'));
    expect(screen.getByText('Add Recurring Transaction')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g. Monthly rent')).toBeTruthy();

    await fireEvent.changeText(screen.getByPlaceholderText('e.g. Monthly rent'), 'Annual Insurance');
    await fireEvent.changeText(screen.getByPlaceholderText('0.00'), '900');
    await fireEvent.press(screen.getByText('Rent'));
    await fireEvent.press(screen.getByText('Save Recurring Transaction'));

    expect(addRecurring).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Annual Insurance',
      category_id: 1,
      amount: 900,
      frequency: 'monthly',
    }));
  });

  test('asks for confirmation before deleting a recurring transaction', async () => {
    const screen = await render(<RecurringScreen />);

    await fireEvent.press(screen.getByLabelText('Delete Monthly Rent'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete recurring transaction?',
      'Monthly Rent will be deleted.',
      expect.any(Array),
    );

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const deleteButton = buttons.find((button: any) => button.text === 'Delete');
    await act(async () => {
      deleteButton.onPress();
    });
    expect(deleteRecurring).toHaveBeenCalledWith('1');
  });
});
