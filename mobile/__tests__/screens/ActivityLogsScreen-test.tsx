import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { useApp } from '@/context/AppContext';
import type { ActivityLog } from '@/types';
import ActivityLogsScreen from '@/screens/ActivityLogsScreen';

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

const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;

const logs: ActivityLog[] = [
  {
    id: '1',
    timestamp: '11/23/2026, 8:00:00 AM',
    user: 'Alice Admin',
    email: 'alice@example.com',
    action: 'create transaction',
    description: 'Created a rent transaction',
    ipAddress: '192.168.1.10',
    details: { userAgent: 'Test Agent', payload: { id: 7 } },
  },
  {
    id: '2',
    timestamp: '11/22/2026, 5:00:00 PM',
    user: 'Bob User',
    email: 'bob@example.com',
    action: 'delete category',
    description: 'Deleted old category',
    ipAddress: '10.0.0.2',
  },
];

const setLogs = (activityLogs: ActivityLog[]) => {
  mockUseApp.mockReturnValue({ activityLogs } as unknown as ReturnType<typeof useApp>);
};

beforeEach(() => {
  jest.clearAllMocks();
  setLogs(logs);
});

describe('<ActivityLogsScreen />', () => {
  test('renders the header and the activity logs from context', async () => {
    const screen = await render(<ActivityLogsScreen />);

    expect(screen.getByText('Activity Logs')).toBeTruthy();
    expect(screen.getByText('Alice Admin')).toBeTruthy();
    expect(screen.getByText('Created a rent transaction')).toBeTruthy();
    expect(screen.getByText('192.168.1.10')).toBeTruthy();
    expect(screen.getByText('Bob User')).toBeTruthy();
    expect(screen.getByText('Showing 2 of 2 logs')).toBeTruthy();
  });

  test('filters logs using the search input', async () => {
    const screen = await render(<ActivityLogsScreen />);
    const search = screen.getByPlaceholderText('Search logs...');

    await fireEvent.changeText(search, 'Bob');
    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 1 logs')).toBeTruthy();
      expect(screen.getByText('Bob User')).toBeTruthy();
      expect(screen.queryByText('Alice Admin')).toBeNull();
    });

    await fireEvent.changeText(search, 'no-such-log');
    await waitFor(() => {
      expect(screen.getByText('No activity logs match your filters.')).toBeTruthy();
    });
  });

  test('toggles the filter panel and expands log details', async () => {
    const screen = await render(<ActivityLogsScreen />);

    await fireEvent.press(screen.getByText('Filter'));
    await waitFor(() => {
      expect(screen.getByText('Hide')).toBeTruthy();
      expect(screen.getByText('Date Range')).toBeTruthy();
    });

    expect(screen.queryByText('Activity Details')).toBeNull();
    await fireEvent.press(screen.getAllByText('Details')[0]);
    await waitFor(() => {
      expect(screen.getByText('Activity Details')).toBeTruthy();
      expect(screen.getByText('User: alice@example.com')).toBeTruthy();
      expect(screen.getByText('Test Agent')).toBeTruthy();
    });
  });

  test('shows an empty state when no logs exist', async () => {
    setLogs([]);
    const screen = await render(<ActivityLogsScreen />);

    expect(screen.getByText('No activity logs have been recorded yet.')).toBeTruthy();
    expect(screen.getByText('Showing 0 of 0 logs')).toBeTruthy();
  });
});
