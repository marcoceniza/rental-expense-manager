(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useApp } from '@/context/AppContext';
import { getDashboard } from '@/services/api';
import DashboardScreen from '@/screens/DashboardScreen';

jest.mock('@/context/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('@/services/api', () => ({ getDashboard: jest.fn() }));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = (props: any) => ReactModule.createElement(View, null, props.children);
  const names = [
    'LayoutGrid', 'TrendingUp', 'TrendingDown', 'CreditCard', 'Wallet',
    'ChevronLeft', 'ChevronRight', 'ArrowRight',
  ];
  return Object.fromEntries(names.map((name) => [name, Icon]));
});

jest.mock('react-native-svg', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Primitive = (props: any) => ReactModule.createElement(View, null, props.children);
  const names = [
    'Svg', 'Circle', 'Path', 'Rect', 'Line', 'G', 'Ellipse',
    'Polygon', 'Polyline', 'Text', 'Defs',
  ];
  return Object.fromEntries(names.map((name) => [name, Primitive]));
});

const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;
const mockGetDashboard = getDashboard as jest.MockedFunction<typeof getDashboard>;
type AppCtx = ReturnType<typeof useApp>;
const asContext = (value: Partial<AppCtx>) => value as unknown as AppCtx;

const adminUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  createdAt: '2026-01-01',
  role: 'Admin' as const,
};
const standardUser = { ...adminUser, role: 'Standard' as const };

const dashboardResponse = {
  month: '2026-11',
  categories: [],
  monthly_report: { income: 5000, expense: 1500, liability: 200, net: 3300 },
  transactions: [
    {
      id: 1,
      category_id: 1,
      type: 'income' as const,
      amount: 5000,
      transaction_date: '2026-11-05',
      description: 'Monthly Rent',
      remarks: null,
      deleted_at: null,
      category: {
        id: 1,
        name: 'Rent',
        type: 'income' as const,
        is_tuition: false,
        is_other: false,
      },
      user: null,
    },
  ],
};

describe('<DashboardScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockGetDashboard.mockResolvedValue(
      dashboardResponse as unknown as Awaited<ReturnType<typeof getDashboard>>,
    );
    mockUseApp.mockReturnValue(asContext({ setActiveTab: jest.fn(), currentUser: adminUser }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the financial overview header and admin month controls', async () => {
    const screen = await render(<DashboardScreen />);

    expect(screen.getByText('Financial Overview')).toBeTruthy();
    expect(screen.getByText('Track your income and expenses efficiently.')).toBeTruthy();
    expect(screen.getByText('This Month')).toBeTruthy();
    expect(screen.getByText('Monthly Overview')).toBeTruthy();
    expect(screen.getByText('Recent Activity')).toBeTruthy();
  });

  test('loads the monthly report and renders figures with recent activity', async () => {
    const screen = await render(<DashboardScreen />);

    await waitFor(() => expect(screen.getByText('Monthly Rent')).toBeTruthy());
    expect(screen.getByText('₱5,000.00')).toBeTruthy();
    expect(screen.getByText('₱3,300.00')).toBeTruthy();
    expect(screen.getByText('Total Volume')).toBeTruthy();
    expect(mockGetDashboard).toHaveBeenCalled();
  });

  test('View All switches to the transactions tab and non-admins have no month controls', async () => {
    const setActiveTab = jest.fn();
    mockUseApp.mockReturnValue(asContext({ setActiveTab, currentUser: standardUser }));

    const screen = await render(<DashboardScreen />);

    expect(screen.queryByText('This Month')).toBeNull();
    await fireEvent.press(screen.getByText('View All'));
    expect(setActiveTab).toHaveBeenCalledWith('transactions');
  });

  test('changing the month refetches the dashboard', async () => {
    const screen = await render(<DashboardScreen />);

    const currentMonth = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    const monthText = screen.getByText(currentMonth);
    const nextMonthButton = monthText.parent?.children[2] as any;
    if (!nextMonthButton) {
      throw new Error('Month navigation button not found');
    }
    await fireEvent.press(nextMonthButton);

    await waitFor(() => expect(mockGetDashboard).toHaveBeenCalledTimes(2));
  });
});
