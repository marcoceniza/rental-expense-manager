jest.mock('@/context/AppContext', () => ({
  useApp: jest.fn(),
}));

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Redirect: (props: { href: string }) =>
      require('react').createElement('RedirectMock', { testID: 'redirect', href: props.href }),
  };
});

jest.mock('@/components/ManagerLayout', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => require('react').createElement('ManagerLayoutMock', { testID: 'manager-layout' }),
  };
});

import { render } from '@testing-library/react-native';
import HomeScreen from '@/app/index';
import { useApp } from '@/context/AppContext';

type AppContextValue = ReturnType<typeof useApp>;
const mockUseApp = useApp as jest.Mock;

function mockApp(overrides: Record<string, unknown> = {}) {
  const value = {
    isAuthLoading: false,
    isAuthenticated: false,
    ...overrides,
  };
  mockUseApp.mockReturnValue(value as unknown as AppContextValue);
  return value;
}

describe('<HomeScreen />', () => {
  beforeEach(() => {
    mockUseApp.mockReset();
  });

  test('shows a session-check spinner while auth is loading', async () => {
    mockApp({ isAuthLoading: true });

    const { getByText, queryByTestId } = await render(<HomeScreen />);

    expect(getByText('Checking your session...')).toBeTruthy();
    expect(queryByTestId('redirect')).toBeNull();
    expect(queryByTestId('manager-layout')).toBeNull();
  });

  test('loading state wins even when the user is authenticated', async () => {
    mockApp({ isAuthLoading: true, isAuthenticated: true });

    const { getByText, queryByTestId } = await render(<HomeScreen />);

    expect(getByText('Checking your session...')).toBeTruthy();
    expect(queryByTestId('manager-layout')).toBeNull();
  });

  test('redirects unauthenticated users to /login', async () => {
    mockApp({ isAuthenticated: false });

    const { getByTestId, queryByTestId } = await render(<HomeScreen />);

    expect(getByTestId('redirect').props.href).toBe('/login');
    expect(queryByTestId('manager-layout')).toBeNull();
    expect(queryByTestId('redirect')).toBeTruthy();
  });

  test('renders ManagerLayout for authenticated users', async () => {
    mockApp({ isAuthenticated: true });

    const { getByTestId, queryByTestId } = await render(<HomeScreen />);

    expect(getByTestId('manager-layout')).toBeTruthy();
    expect(queryByTestId('redirect')).toBeNull();
  });
});
