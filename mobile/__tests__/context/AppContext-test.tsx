import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

import { AppProvider, useApp } from '@/context/AppContext';
import * as api from '@/services/api';
import { getAccessToken } from '@/services/axios';

jest.mock('@/services/api', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
  getCategories: jest.fn(),
  getPaginatedTransactions: jest.fn(),
  getRecurringTransactions: jest.fn(),
  getUsers: jest.fn(),
  getActivityLogs: jest.fn(),
  getTrashedTransactions: jest.fn(),
  getCharityTransactions: jest.fn(),
  getOtherTransactions: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  restoreTransaction: jest.fn(),
  permanentlyDeleteTransaction: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  createRecurring: jest.fn(),
  updateRecurring: jest.fn(),
  deleteRecurring: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock('@/services/axios', () => ({
  getAccessToken: jest.fn(),
  setAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));

let ctx: ReturnType<typeof useApp> | null = null;

function Probe() {
  const value = useApp();
  useEffect(() => {
    ctx = value;
  }, [value]);
  return <Text>{value.isAuthLoading ? 'loading' : 'ready'}</Text>;
}

async function renderProvider() {
  const result = await render(
    <AppProvider>
      <Probe />
    </AppProvider>,
  );
  await waitFor(() => expect(ctx?.isAuthLoading).toBe(false));
  return result;
}

const apiUser = {
  id: 1,
  name: 'Admin',
  email: 'admin@example.com',
  user_type: 'admin' as const,
  created_at: '2024-01-01T00:00:00Z',
};
const apiCategory = {
  id: 5,
  name: 'Food',
  type: 'expense' as const,
  is_tuition: false,
  is_other: false,
};
const apiTransaction = {
  id: 10,
  category_id: 5,
  type: 'expense' as const,
  amount: '25.50',
  transaction_date: '2024-03-15',
  description: 'Lunch',
  remarks: null,
  category: apiCategory,
  user: apiUser,
};
const apiRecurring = {
  id: 7,
  category_id: 5,
  category: apiCategory,
  amount: 100,
  frequency: 'monthly' as const,
  start_date: '2024-01-01',
  end_date: null,
  description: 'Rent',
};
const apiLog = {
  id: 1,
  user_name: 'Admin',
  user_email: 'admin@example.com',
  action: 'login',
  description: null,
  ip_address: null,
  user_agent: null,
  payload: null,
  created_at: '2024-03-15T10:00:00Z',
};

function mockSuccessfulLoad() {
  (api.getCategories as jest.Mock).mockResolvedValue([apiCategory]);
  (api.getPaginatedTransactions as jest.Mock).mockResolvedValue({
    data: [apiTransaction],
    last_page: 1,
  });
  (api.getRecurringTransactions as jest.Mock).mockResolvedValue([apiRecurring]);
  (api.getUsers as jest.Mock).mockResolvedValue([{ ...apiUser }]);
  (api.getActivityLogs as jest.Mock).mockResolvedValue([apiLog]);
  (api.getTrashedTransactions as jest.Mock).mockResolvedValue([]);
}

async function signIn() {
  mockSuccessfulLoad();
  (api.login as jest.Mock).mockResolvedValue({ token: 'token', user: apiUser });
  await act(async () => {
    await ctx!.signIn('admin@example.com', 'password');
  });
}

describe('AppProvider / useApp', () => {
  beforeEach(() => {
    ctx = null;
    jest.clearAllMocks();
    (getAccessToken as jest.Mock).mockResolvedValue(null);
  });

  it('starts unauthenticated when no token is stored', async () => {
    const { getByText } = await renderProvider();

    expect(getByText('ready')).toBeTruthy();
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(ctx?.isAuthLoading).toBe(false);
    expect(ctx?.isAuthenticated).toBe(false);
    expect(ctx?.currentUser).toBeNull();
    expect(ctx?.activeTab).toBe('dashboard');
  });

  it('throws when useApp is used outside of AppProvider', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    function Orphan() {
      useApp();
      return null;
    }

    await expect(render(<Orphan />)).rejects.toThrow(
      'useApp must be used within an AppProvider',
    );
    errorSpy.mockRestore();
  });

  it('signIn loads remote data and maps it into domain models', async () => {
    await renderProvider();

    await signIn();

    expect(api.login).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'password',
    });
    expect(ctx?.isAuthenticated).toBe(true);
    expect(ctx?.currentUser).toEqual({
      id: '1',
      name: 'Admin',
      email: 'admin@example.com',
      createdAt: '2024-01-01',
      role: 'Admin',
    });
    expect(ctx?.categories).toEqual([
      {
        id: '5',
        name: 'Food',
        type: 'EXPENSE',
        isCharity: false,
        isOther: false,
        transactionsCount: 0,
      },
    ]);
    expect(ctx?.transactions[0]).toMatchObject({
      id: '10',
      description: 'Lunch',
      amount: 25.5,
      type: 'EXPENSE',
      category: 'Food',
    });
    expect(ctx?.activityLogs[0].user).toBe('Admin');
    expect(ctx?.recurring[0].title).toBe('Rent');
  });

  it('addTransaction prepends the created transaction', async () => {
    await renderProvider();
    const created = { ...apiTransaction, id: 99, description: 'New expense' };
    (api.createTransaction as jest.Mock).mockResolvedValue(created);
    const input = {
      category_id: 5,
      type: 'expense' as const,
      amount: 12,
      transaction_date: '2024-03-16',
      description: 'New expense',
    };

    await act(async () => {
      await ctx!.addTransaction(input);
    });

    expect(api.createTransaction).toHaveBeenCalledWith(input);
    expect(ctx?.transactions).toHaveLength(1);
    expect(ctx?.transactions[0].description).toBe('New expense');
  });

  it('fetchCharityTransactions maps API transactions', async () => {
    await renderProvider();
    (api.getCharityTransactions as jest.Mock).mockResolvedValue([
      apiTransaction,
    ]);
    let mapped: Array<{ description: string }> = [];

    await act(async () => {
      mapped = await ctx!.fetchCharityTransactions(2024);
    });

    expect(api.getCharityTransactions).toHaveBeenCalledWith(2024);
    expect(mapped[0].description).toBe('Lunch');
  });

  it('setActiveTab updates the active tab', async () => {
    await renderProvider();

    await act(async () => {
      ctx!.setActiveTab('reports');
    });

    expect(ctx?.activeTab).toBe('reports');
  });

  it('signOut clears the session and all loaded data', async () => {
    await renderProvider();
    await signIn();
    expect(ctx?.isAuthenticated).toBe(true);

    (api.logout as jest.Mock).mockResolvedValue({ message: 'bye' });
    await act(async () => {
      await ctx!.signOut();
    });

    expect(api.logout).toHaveBeenCalledTimes(1);
    expect(ctx?.isAuthenticated).toBe(false);
    expect(ctx?.currentUser).toBeNull();
    expect(ctx?.transactions).toHaveLength(0);
    expect(ctx?.categories).toHaveLength(0);
  });
});
