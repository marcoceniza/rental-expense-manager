import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { useApp } from '@/context/AppContext';
import type { UserAccount } from '@/types';
import CreateUserScreen from '@/screens/CreateUserScreen';

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
const addUser = jest.fn<Promise<void>, [string, string, string]>();

const users: UserAccount[] = [
  { id: '1', name: 'Alice Admin', email: 'alice@example.com', createdAt: '2026-01-01', role: 'Admin' },
];

const setUsers = (value: UserAccount[]) => {
  mockUseApp.mockReturnValue({ addUser, users: value } as unknown as ReturnType<typeof useApp>);
};

beforeEach(() => {
  jest.clearAllMocks();
  addUser.mockResolvedValue(undefined);
  setUsers(users);
});

describe('<CreateUserScreen />', () => {
  test('renders the form and the active accounts list', async () => {
    const screen = await render(<CreateUserScreen />);

    expect(screen.getByText('Create User')).toBeTruthy();
    expect(screen.getByText('Active Accounts')).toBeTruthy();
    expect(screen.getByText('Alice Admin')).toBeTruthy();
    expect(screen.getByText('alice@example.com')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByPlaceholderText('Full Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('email@example.com')).toBeTruthy();
  });

  test('creates a user with the entered details', async () => {
    jest.useFakeTimers();
    const screen = await render(<CreateUserScreen />);

    await fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'secret123');
    await fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'secret123');
    await fireEvent.changeText(screen.getByPlaceholderText('Full Name'), 'Jane Doe');
    await fireEvent.changeText(screen.getByPlaceholderText('email@example.com'), 'jane@example.com');
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Full Name')).toHaveProperty('props.value', 'Jane Doe');
      expect(screen.getByPlaceholderText('email@example.com')).toHaveProperty('props.value', 'jane@example.com');
      expect(screen.getAllByPlaceholderText('••••••••')[1]).toHaveProperty('props.value', 'secret123');
    });
    await fireEvent.press(screen.getByText('Create user'));

    expect(addUser).toHaveBeenCalledWith('Jane Doe', 'jane@example.com', 'secret123');
    expect(screen.getByText('User "Jane Doe" created successfully.')).toBeTruthy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('shows an empty state when there are no users', async () => {
    setUsers([]);
    const screen = await render(<CreateUserScreen />);

    expect(screen.getByText('No user accounts found.')).toBeTruthy();
  });

  test('alerts when the passwords do not match', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const screen = await render(<CreateUserScreen />);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    await fireEvent.changeText(screen.getByPlaceholderText('Full Name'), 'Jane Doe');
    await fireEvent.changeText(screen.getByPlaceholderText('email@example.com'), 'jane@example.com');
    await fireEvent.changeText(passwordInputs[0], 'secret123');
    await fireEvent.changeText(passwordInputs[1], 'different');
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('••••••••')[1]).toHaveProperty('props.value', 'different');
    });
    await fireEvent.press(screen.getByText('Create user'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Invalid password',
      'Enter a password and make sure both password fields match.',
    );
    expect(addUser).not.toHaveBeenCalled();
  });
});
