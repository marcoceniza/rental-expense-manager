import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { useApp } from '@/context/AppContext';
import LoginScreen from '@/screens/LoginScreen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Redirect: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

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
const signIn = jest.fn<Promise<void>, [string, string]>();

const setAuth = (overrides: Record<string, unknown> = {}) => {
  mockUseApp.mockReturnValue({
    signIn,
    isAuthenticated: false,
    isAuthLoading: false,
    authError: null,
    ...overrides,
  } as unknown as ReturnType<typeof useApp>);
};

beforeEach(() => {
  jest.clearAllMocks();
  signIn.mockResolvedValue(undefined);
  setAuth();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('<LoginScreen />', () => {
  test('renders the sign-in form', async () => {
    const screen = await render(<LoginScreen />);

    expect(screen.getByText('Rental Expense Manager')).toBeTruthy();
    expect(screen.getByText('Sign in to continue')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });

  test('displays an auth error coming from context', async () => {
    setAuth({ authError: 'Invalid credentials.' });
    const screen = await render(<LoginScreen />);

    expect(screen.getByText('Invalid credentials.')).toBeTruthy();
  });

  test('shows only a spinner while auth is loading', async () => {
    setAuth({ isAuthLoading: true });
    const screen = await render(<LoginScreen />);

    expect(screen.queryByText('Rental Expense Manager')).toBeNull();
    expect(screen.queryByText('Sign In')).toBeNull();
  });

  test('alerts when either field is empty', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const screen = await render(<LoginScreen />);

    await fireEvent.press(screen.getByText('Sign In'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Missing fields',
      'Please enter your email and password.',
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  test('signs in with the entered credentials and navigates home', async () => {
    const screen = await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@example.com');
    await fireEvent.changeText(screen.getByPlaceholderText('Password'), 'pass123');
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toHaveProperty('props.value', 'user@example.com');
      expect(screen.getByPlaceholderText('Password')).toHaveProperty('props.value', 'pass123');
    });
    await fireEvent.press(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('user@example.com', 'pass123');
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});
