function mockIcon(name: string) {
  return (props: Record<string, unknown>) =>
    require('react').createElement('Icon', { name, ...props });
}

jest.mock('lucide-react-native', () => ({
  Eye: mockIcon('Eye'),
  EyeOff: mockIcon('EyeOff'),
  Mail: mockIcon('Mail'),
  Lock: mockIcon('Lock'),
}));

jest.mock('@/context/AppContext', () => ({
  useApp: jest.fn(),
}));

jest.mock('expo-router', () => {
  const React = require('react');
  const replace = jest.fn();
  return {
    Redirect: (props: { href: string }) =>
      require('react').createElement('RedirectMock', { testID: 'redirect', href: props.href }),
    useRouter: () => ({ replace, push: jest.fn(), back: jest.fn() }),
    __replace: replace,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginRoute from '@/app/login';
import { useApp } from '@/context/AppContext';

type AppContextValue = ReturnType<typeof useApp>;
const mockUseApp = useApp as jest.Mock;
const mockReplace = (jest.requireMock('expo-router') as { __replace: jest.Mock }).__replace;
const mockSignIn = jest.fn();

function mockApp(overrides: Record<string, unknown> = {}) {
  const value = {
    signIn: mockSignIn,
    isAuthenticated: false,
    isAuthLoading: false,
    authError: null,
    ...overrides,
  };
  mockUseApp.mockReturnValue(value as unknown as AppContextValue);
  return value;
}

describe('<LoginRoute />', () => {
  beforeEach(() => {
    mockUseApp.mockReset();
    mockSignIn.mockReset();
    mockReplace.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('re-exports LoginScreen and renders the sign-in form', async () => {
    mockApp();

    const { getByText, getByPlaceholderText } = await render(<LoginRoute />);

    expect(getByText('Rental Expense Manager')).toBeTruthy();
    expect(getByText('Sign in to continue')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Use your Rental Expense Manager account.')).toBeTruthy();
  });

  test('shows only a spinner while authentication is loading', async () => {
    mockApp({ isAuthLoading: true });

    const { queryByText, queryByPlaceholderText } = await render(<LoginRoute />);

    expect(queryByText('Sign In')).toBeNull();
    expect(queryByPlaceholderText('Email')).toBeNull();
  });

  test('redirects an already authenticated user to /', async () => {
    mockApp({ isAuthenticated: true });

    const { getByTestId } = await render(<LoginRoute />);

    expect(getByTestId('redirect').props.href).toBe('/');
  });

  test('displays the auth error passed by the context', async () => {
    mockApp({ authError: 'Session expired' });

    const { getByText } = await render(<LoginRoute />);

    expect(getByText('Session expired')).toBeTruthy();
  });

  test('alerts when either field is empty and does not call signIn', async () => {
    mockApp();

    const { getByText } = await render(<LoginRoute />);
    await fireEvent.press(getByText('Sign In'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Missing fields',
      'Please enter your email and password.',
    );
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test('signs in with a trimmed email and navigates home', async () => {
    mockApp();

    const { getByText, getByPlaceholderText } = await render(<LoginRoute />);
    await fireEvent.changeText(getByPlaceholderText('Email'), '  user@example.com  ');
    await fireEvent.changeText(getByPlaceholderText('Password'), 'secret');
    await fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'secret');
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  test('shows the sign-in error and stays on the page when signIn rejects', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Bad credentials'));
    mockApp();

    const { getByText, getByPlaceholderText } = await render(<LoginRoute />);
    await fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    await fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
    await fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Sign in failed', 'Bad credentials');
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('toggles password visibility', async () => {
    mockApp();

    const { getByLabelText } = await render(<LoginRoute />);

    expect(getByLabelText('Show password')).toBeTruthy();
    await fireEvent.press(getByLabelText('Show password'));
    expect(getByLabelText('Hide password')).toBeTruthy();
  });
});
