(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useApp } from '@/context/AppContext';
import { getAnnualReport, getCategorySummary } from '@/services/api';
import ReportsScreen from '@/screens/ReportsScreen';

jest.mock('@/context/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('@/services/api', () => ({
  getAnnualReport: jest.fn(),
  getCategorySummary: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Icon = (props: any) => ReactModule.createElement(View, null, props.children);
  const names = ['ChevronDown', 'ChevronUp', 'FileDown', 'FileSpreadsheet', 'PieChart', 'BarChart3'];
  return Object.fromEntries(names.map((name) => [name, Icon]));
});

const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;
const mockGetAnnualReport = getAnnualReport as jest.MockedFunction<typeof getAnnualReport>;
const mockGetCategorySummary = getCategorySummary as jest.MockedFunction<typeof getCategorySummary>;
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

const annualReport = {
  monthly: [{ month: 'January', income: 1000, expense: 400, liability: 100, net: 500 }],
  totals: { income: 1000, expense: 400, liability: 100, net: 500 },
};
const categorySummary = {
  categoryReport: [{ name: 'Rent', type: 'income', total: 1000 }],
  year: new Date().getFullYear(),
};

describe('<ReportsScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockGetAnnualReport.mockResolvedValue(
      annualReport as unknown as Awaited<ReturnType<typeof getAnnualReport>>,
    );
    mockGetCategorySummary.mockResolvedValue(
      categorySummary as unknown as Awaited<ReturnType<typeof getCategorySummary>>,
    );
    mockUseApp.mockReturnValue(asContext({ currentUser: adminUser }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the report header, annual cards, and admin sections', async () => {
    const screen = await render(<ReportsScreen />);

    expect(screen.getByText('Financial Reports')).toBeTruthy();
    expect(screen.getByText('Analyze your annual performance.')).toBeTruthy();
    expect(screen.getByText('ANNUAL INCOME')).toBeTruthy();
    expect(screen.getByText('ANNUAL EXPENSES')).toBeTruthy();
    expect(screen.getByText('ANNUAL LIABILITIES')).toBeTruthy();
    expect(screen.getByText('NET PROFIT/LOSS')).toBeTruthy();
    expect(screen.getByText('Monthly Breakdown')).toBeTruthy();
    expect(screen.getByText('Category Report')).toBeTruthy();
    expect(screen.getByText('Export PDF')).toBeTruthy();
  });

  test('loads the annual report and category summary', async () => {
    const screen = await render(<ReportsScreen />);

    await waitFor(() => expect(screen.getByText('January')).toBeTruthy());
    expect(screen.getByText('TOTALS')).toBeTruthy();
    expect(screen.getByText('Annual Summary')).toBeTruthy();
    expect(screen.getByText('Rent')).toBeTruthy();
    expect(screen.getAllByText('₱1,000.00').length).toBeGreaterThan(0);
  });

  test('changing the selected year refetches both reports', async () => {
    const currentYear = new Date().getFullYear();
    const targetYear = currentYear === 2024 ? 2025 : 2024;
    const screen = await render(<ReportsScreen />);

    await fireEvent.press(screen.getByText(String(currentYear)));
    await fireEvent.press(screen.getByText(String(targetYear)));

    await waitFor(() => expect(mockGetAnnualReport).toHaveBeenCalledWith(targetYear));
    expect(mockGetCategorySummary).toHaveBeenCalledWith(targetYear);
  });

  test('non-admin users do not see admin-only report sections', async () => {
    mockUseApp.mockReturnValue(asContext({ currentUser: standardUser }));

    const screen = await render(<ReportsScreen />);

    expect(screen.queryByText('Export PDF')).toBeNull();
    expect(screen.queryByText('Category Report')).toBeNull();
    expect(screen.getByText('Financial Reports')).toBeTruthy();
  });
});
