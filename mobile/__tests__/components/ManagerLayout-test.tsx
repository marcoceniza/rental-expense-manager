import type { ReactNode } from 'react';

function mockIcon(name: string) {
  return (props: Record<string, unknown>) =>
    require('react').createElement('Icon', { name, ...props });
}

jest.mock('lucide-react-native', () => ({
  FileSpreadsheet: mockIcon('FileSpreadsheet'),
  FileText: mockIcon('FileText'),
  Heart: mockIcon('Heart'),
  LayoutDashboard: mockIcon('LayoutDashboard'),
  LayoutGrid: mockIcon('LayoutGrid'),
  LogOut: mockIcon('LogOut'),
  MoreHorizontal: mockIcon('MoreHorizontal'),
  ChevronRight: mockIcon('ChevronRight'),
  X: mockIcon('X'),
  PieChart: mockIcon('PieChart'),
  Repeat: mockIcon('Repeat'),
  Tag: mockIcon('Tag'),
  UserPlus: mockIcon('UserPlus'),
}));

jest.mock('@/context/AppContext', () => ({
  useApp: jest.fn(),
}));

jest.mock('expo-router', () => {
  const replace = jest.fn();
  return {
    useRouter: () => ({ replace, push: jest.fn(), back: jest.fn() }),
    __replace: replace,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...rest }: { children: ReactNode; edges?: string[] }) =>
      require('react').createElement(
        'SafeAreaViewMock',
        { testID: 'safe-area-view', edges: JSON.stringify(rest.edges) },
        children,
      ),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 24, left: 0 }),
  };
});

function mockScreen(id: string) {
  const React = require('react');
  return {
    __esModule: true,
    default: () => require('react').createElement('ScreenMock', { testID: `screen-${id}` }),
  };
}

jest.mock('@/screens/ActivityLogsScreen', () => mockScreen('activity-logs'));
jest.mock('@/screens/CategoriesScreen', () => mockScreen('categories'));
jest.mock('@/screens/CharityScreen', () => mockScreen('charity'));
jest.mock('@/screens/CreateUserScreen', () => mockScreen('create-user'));
jest.mock('@/screens/DashboardScreen', () => mockScreen('dashboard'));
jest.mock('@/screens/OthersScreen', () => mockScreen('others'));
jest.mock('@/screens/RecurringScreen', () => mockScreen('recurring'));
jest.mock('@/screens/ReportsScreen', () => mockScreen('reports'));
jest.mock('@/screens/TransactionsScreen', () => mockScreen('transactions'));

import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ManagerLayout from '@/components/ManagerLayout';
import { useApp } from '@/context/AppContext';

type AppContextValue = ReturnType<typeof useApp>;
const mockUseApp = useApp as jest.Mock;
const mockReplace = (jest.requireMock('expo-router') as { __replace: jest.Mock }).__replace;
const mockSetActiveTab = jest.fn();
const mockSignOut = jest.fn();

const adminUser = {
  id: '1',
  name: 'Alice Admin',
  email: 'alice@example.com',
  createdAt: '2026-01-01',
  role: 'Admin' as const,
};
const standardUser = {
  ...adminUser,
  id: '2',
  name: 'Sam Standard',
  email: 'sam@example.com',
  role: 'Standard' as const,
};

function mockApp(overrides: Record<string, unknown> = {}) {
  const value = {
    activeTab: 'dashboard',
    setActiveTab: mockSetActiveTab,
    signOut: mockSignOut,
    currentUser: adminUser,
    ...overrides,
  };
  mockUseApp.mockReturnValue(value as unknown as AppContextValue);
  return value;
}

describe('<ManagerLayout />', () => {
  beforeEach(() => {
    mockUseApp.mockReset();
    mockSetActiveTab.mockReset();
    mockSignOut.mockReset();
    mockReplace.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the header, navigation tabs and the active screen', async () => {
    mockApp();

    const { getByText, getByTestId } = await render(<ManagerLayout />);

    expect(getByText('RENTAL EXPENSE')).toBeTruthy();
    expect(getByText('MANAGER')).toBeTruthy();
    expect(getByTestId('screen-dashboard')).toBeTruthy();
    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Transactions')).toBeTruthy();
    expect(getByText('Reports')).toBeTruthy();
    expect(getByText('Categories')).toBeTruthy();
    expect(getByText('More')).toBeTruthy();
  });

  test('passes the expected edges to SafeAreaView and uses the bottom inset', async () => {
    mockApp();

    const { getByTestId, toJSON } = await render(<ManagerLayout />);

    expect(getByTestId('safe-area-view').props.edges).toBe('["top","left","right"]');
    expect(JSON.stringify(toJSON())).toContain('"paddingBottom":24');
  });

  test('renders the screen selected by activeTab', async () => {
    mockApp({ activeTab: 'reports' });

    const { getByTestId, queryByTestId } = await render(<ManagerLayout />);

    expect(getByTestId('screen-reports')).toBeTruthy();
    expect(queryByTestId('screen-dashboard')).toBeNull();
  });

  test('pressing a primary tab calls setActiveTab with its id', async () => {
    mockApp();

    const { getByText } = await render(<ManagerLayout />);
    await fireEvent.press(getByText('Transactions'));

    expect(mockSetActiveTab).toHaveBeenCalledWith('transactions');
  });

  test('an Admin sees all primary and more tabs', async () => {
    mockApp();

    const { getByLabelText, getByText } = await render(<ManagerLayout />);
    expect(getByText('Categories')).toBeTruthy();

    await fireEvent.press(getByLabelText('More tabs'));
    expect(getByText('More options')).toBeTruthy();
    expect(getByText('Recurring')).toBeTruthy();
    expect(getByText('Charity')).toBeTruthy();
    expect(getByText('Others')).toBeTruthy();
    expect(getByText('Create User')).toBeTruthy();
    expect(getByText('Activity Logs')).toBeTruthy();
    expect(getByText('Log out')).toBeTruthy();
  });

  test('a Standard user only sees the restricted tabs', async () => {
    mockApp({ currentUser: standardUser });

    const { getByLabelText, getByText, queryByText } = await render(<ManagerLayout />);
    expect(queryByText('Categories')).toBeNull();

    await fireEvent.press(getByLabelText('More tabs'));
    expect(getByText('Charity')).toBeTruthy();
    expect(queryByText('Recurring')).toBeNull();
    expect(queryByText('Others')).toBeNull();
    expect(queryByText('Create User')).toBeNull();
    expect(queryByText('Activity Logs')).toBeNull();
  });

  test('pressing a more tab selects it and closes the menu', async () => {
    mockApp();

    const { getByLabelText, getByText, queryByText } = await render(<ManagerLayout />);
    await fireEvent.press(getByLabelText('More tabs'));
    await fireEvent.press(getByText('Charity'));

    expect(mockSetActiveTab).toHaveBeenCalledWith('charity');
    await waitFor(() => expect(queryByText('More options')).toBeNull());
  });

  test('opens the account menu with the current user details', async () => {
    mockApp();

    const { getByLabelText, getByText, queryByText } = await render(<ManagerLayout />);
    expect(queryByText('alice@example.com')).toBeNull();

    await fireEvent.press(getByLabelText('Account information'));

    expect(getByText('alice@example.com')).toBeTruthy();
    expect(getByText('Admin')).toBeTruthy();
  });

  test('logs out after confirmation and redirects to /login', async () => {
    mockApp();

    const { getByLabelText, getByText } = await render(<ManagerLayout />);
    await fireEvent.press(getByLabelText('More tabs'));
    await fireEvent.press(getByText('Log out'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Log out?',
      'You will need to sign in again to access your account.',
      expect.any(Array),
    );
    const call = (Alert.alert as jest.Mock).mock.calls.find((args) => args[0] === 'Log out?');
    const confirmButton = (call?.[2] as Array<{ text: string; onPress?: () => void }> | undefined)
      ?.find((button) => button.text === 'Log out');
    confirmButton?.onPress?.();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  test('still redirects to /login when signOut fails', async () => {
    mockSignOut.mockRejectedValueOnce(new Error('Server unavailable'));
    mockApp();

    const { getByLabelText, getByText } = await render(<ManagerLayout />);
    await fireEvent.press(getByLabelText('More tabs'));
    await fireEvent.press(getByText('Log out'));

    const call = (Alert.alert as jest.Mock).mock.calls.find((args) => args[0] === 'Log out?');
    const confirmButton = (call?.[2] as Array<{ text: string; onPress?: () => void }> | undefined)
      ?.find((button) => button.text === 'Log out');
    confirmButton?.onPress?.();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Signed out locally',
        'The server could not end the session: Server unavailable',
      );
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });
});
