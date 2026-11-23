import { api, clearAccessToken, setAccessToken } from '@/services/axios';
import * as service from '@/services/api';

jest.mock('@/services/axios', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
  },
  getAccessToken: jest.fn(),
  setAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));

const getMock = api.get as unknown as jest.Mock;
const postMock = api.post as unknown as jest.Mock;
const patchMock = api.patch as unknown as jest.Mock;
const deleteMock = api.delete as unknown as jest.Mock;
const setTokenMock = setAccessToken as unknown as jest.Mock;
const clearTokenMock = clearAccessToken as unknown as jest.Mock;

function makeTransaction(id: number) {
  return {
    id,
    category_id: 1,
    type: 'expense' as const,
    amount: 10,
    transaction_date: '2024-01-01',
    description: `tx-${id}`,
    remarks: null,
    category: null,
    user: null,
  };
}

describe('services/api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login posts credentials and stores the returned token', async () => {
    const payload = {
      token: 'jwt-token',
      user: { id: 1, name: 'A', email: 'a@b.c', user_type: 'user' as const },
    };
    postMock.mockResolvedValue({ data: payload });
    const input = { email: 'a@b.c', password: 'secret' };

    await expect(service.login(input)).resolves.toEqual(payload);

    expect(postMock).toHaveBeenCalledWith('/api/v1/login', input);
    expect(setTokenMock).toHaveBeenCalledWith('jwt-token');
    expect(setTokenMock).toHaveBeenCalledTimes(1);
  });

  it('logout posts to the logout endpoint and clears the token', async () => {
    postMock.mockResolvedValue({ data: { message: 'bye' } });

    await expect(service.logout()).resolves.toEqual({ message: 'bye' });

    expect(postMock).toHaveBeenCalledWith('/api/v1/logout');
    expect(clearTokenMock).toHaveBeenCalledTimes(1);
  });

  it('logout clears the token even when the request fails', async () => {
    postMock.mockRejectedValue(new Error('network down'));

    await expect(service.logout()).rejects.toThrow('network down');
    expect(clearTokenMock).toHaveBeenCalledTimes(1);
  });

  it('me fetches the current user', async () => {
    const user = { id: 1, name: 'A', email: 'a@b.c', user_type: 'user' as const };
    getMock.mockResolvedValue({ data: { user } });

    await expect(service.me()).resolves.toEqual({ user });
    expect(getMock).toHaveBeenCalledWith('/api/v1/me');
  });

  it('getCategories returns the nested data array', async () => {
    const categories = [
      {
        id: 1,
        name: 'Food',
        type: 'expense' as const,
        is_tuition: false,
        is_other: false,
      },
    ];
    getMock.mockResolvedValue({ data: { data: categories } });

    await expect(service.getCategories()).resolves.toEqual(categories);
    expect(getMock).toHaveBeenCalledWith('/api/v1/categories');
  });

  it('getPaginatedTransactions defaults to page 1 and returns last_page', async () => {
    const items = [makeTransaction(1)];
    getMock.mockResolvedValue({ data: { data: items, meta: { last_page: 3 } } });

    await expect(service.getPaginatedTransactions()).resolves.toEqual({
      data: items,
      last_page: 3,
    });
    expect(getMock).toHaveBeenCalledWith('/api/v1/transactions', {
      params: { page: 1 },
    });
  });

  it('getPaginatedTransactions forwards an explicit page', async () => {
    getMock.mockResolvedValue({ data: { data: [], meta: { last_page: 1 } } });

    await service.getPaginatedTransactions(4);

    expect(getMock).toHaveBeenCalledWith('/api/v1/transactions', {
      params: { page: 4 },
    });
  });

  it('getTrashedTransactions fetches every page when more than one exists', async () => {
    const a = makeTransaction(1);
    const b = makeTransaction(2);
    getMock
      .mockResolvedValueOnce({ data: { data: [a], meta: { last_page: 2 } } })
      .mockResolvedValueOnce({ data: { data: [b], meta: { last_page: 2 } } });

    await expect(service.getTrashedTransactions()).resolves.toEqual([a, b]);

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/v1/transactions/trash');
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/v1/transactions/trash', {
      params: { page: 2 },
    });
  });

  it('getTrashedTransactions stops after a single page', async () => {
    const a = makeTransaction(1);
    getMock.mockResolvedValue({ data: { data: [a], meta: { last_page: 1 } } });

    await expect(service.getTrashedTransactions()).resolves.toEqual([a]);
    expect(getMock).toHaveBeenCalledTimes(1);
  });

  it('getCharityTransactions maps report pages and includes the year', async () => {
    const a = makeTransaction(1);
    const b = makeTransaction(2);
    getMock
      .mockResolvedValueOnce({
        data: { transactions: [a], meta: { last_page: 2 } },
      })
      .mockResolvedValueOnce({
        data: { transactions: [b], meta: { last_page: 2 } },
      });

    await expect(service.getCharityTransactions(2024)).resolves.toEqual([a, b]);

    expect(getMock).toHaveBeenNthCalledWith(
      1,
      '/api/v1/reports/charity?year=2024',
    );
    expect(getMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/reports/charity?year=2024',
      { params: { page: 2 } },
    );
  });

  it('getOtherTransactions targets the others report', async () => {
    getMock.mockResolvedValue({
      data: { transactions: [], meta: { last_page: 1 } },
    });

    await expect(service.getOtherTransactions(2023)).resolves.toEqual([]);
    expect(getMock).toHaveBeenCalledWith('/api/v1/reports/others?year=2023');
  });

  it('restoreTransaction patches the restore endpoint', async () => {
    const tx = makeTransaction(9);
    patchMock.mockResolvedValue({ data: { data: tx } });

    await expect(service.restoreTransaction('9')).resolves.toEqual(tx);
    expect(patchMock).toHaveBeenCalledWith('/api/v1/transactions/9/restore');
  });

  it('permanentlyDeleteTransaction deletes the force-delete endpoint', async () => {
    deleteMock.mockResolvedValue({});

    await service.permanentlyDeleteTransaction('9');

    expect(deleteMock).toHaveBeenCalledWith(
      '/api/v1/transactions/9/force-delete',
    );
  });

  it('createTransaction posts the payload', async () => {
    const tx = makeTransaction(1);
    const input = {
      category_id: 1,
      type: 'expense' as const,
      amount: 10,
      transaction_date: '2024-01-01',
      description: 'lunch',
    };
    postMock.mockResolvedValue({ data: { data: tx } });

    await expect(service.createTransaction(input)).resolves.toEqual(tx);
    expect(postMock).toHaveBeenCalledWith('/api/v1/transactions', input);
  });

  it('updateTransaction patches the transaction', async () => {
    const tx = makeTransaction(1);
    const input = {
      category_id: 1,
      type: 'income' as const,
      amount: 20,
      transaction_date: '2024-01-02',
      description: 'salary',
    };
    patchMock.mockResolvedValue({ data: { data: tx } });

    await expect(service.updateTransaction('1', input)).resolves.toEqual(tx);
    expect(patchMock).toHaveBeenCalledWith('/api/v1/transactions/1', input);
  });

  it('deleteTransaction deletes the transaction', async () => {
    deleteMock.mockResolvedValue({});

    await service.deleteTransaction('1');

    expect(deleteMock).toHaveBeenCalledWith('/api/v1/transactions/1');
  });

  it('getRecurringTransactions returns the nested data array', async () => {
    const items = [{ id: 1, description: 'rent' }];
    getMock.mockResolvedValue({ data: { data: items } });

    await expect(service.getRecurringTransactions()).resolves.toEqual(items);
    expect(getMock).toHaveBeenCalledWith('/api/v1/recurring');
  });

  it('createRecurring posts the payload', async () => {
    const item = { id: 1, description: 'rent' };
    const input = {
      category_id: 1,
      amount: 500,
      frequency: 'monthly' as const,
      start_date: '2024-01-01',
      description: 'rent',
    };
    postMock.mockResolvedValue({ data: { data: item } });

    await expect(service.createRecurring(input)).resolves.toEqual(item);
    expect(postMock).toHaveBeenCalledWith('/api/v1/recurring', input);
  });

  it('updateRecurring patches the recurring entry', async () => {
    const item = { id: 1, description: 'rent' };
    const input = {
      category_id: 1,
      amount: 600,
      frequency: 'monthly' as const,
      start_date: '2024-01-01',
      description: 'rent',
    };
    patchMock.mockResolvedValue({ data: { data: item } });

    await expect(service.updateRecurring('1', input)).resolves.toEqual(item);
    expect(patchMock).toHaveBeenCalledWith('/api/v1/recurring/1', input);
  });

  it('deleteRecurring deletes the recurring entry', async () => {
    deleteMock.mockResolvedValue({});

    await service.deleteRecurring('1');

    expect(deleteMock).toHaveBeenCalledWith('/api/v1/recurring/1');
  });

  it('getUsers returns the nested data array', async () => {
    const users = [{ id: 1, name: 'Admin' }];
    getMock.mockResolvedValue({ data: { data: users } });

    await expect(service.getUsers()).resolves.toEqual(users);
    expect(getMock).toHaveBeenCalledWith('/api/v1/users');
  });

  it('getActivityLogs fetches every page of logs', async () => {
    const log = { id: 1, action: 'login' };
    getMock.mockResolvedValue({
      data: { data: [log], meta: { last_page: 1 } },
    });

    await expect(service.getActivityLogs()).resolves.toEqual([log]);
    expect(getMock).toHaveBeenCalledWith('/api/v1/logs');
  });

  it('getAnnualReport forwards the year as a query param', async () => {
    const report = { monthly: [], totals: {} };
    getMock.mockResolvedValue({ data: report });

    await expect(service.getAnnualReport(2024)).resolves.toEqual(report);
    expect(getMock).toHaveBeenCalledWith('/api/v1/reports/annual', {
      params: { year: 2024 },
    });
  });

  it('getCategorySummary forwards the year as a query param', async () => {
    const summary = { categoryReport: [], year: 2024 };
    getMock.mockResolvedValue({ data: summary });

    await expect(service.getCategorySummary(2024)).resolves.toEqual(summary);
    expect(getMock).toHaveBeenCalledWith('/api/v1/reports/category-summary', {
      params: { year: 2024 },
    });
  });

  it('getDashboard forwards the month as a query param', async () => {
    const dashboard = { month: '2024-03' };
    getMock.mockResolvedValue({ data: dashboard });

    await expect(service.getDashboard('2024-03')).resolves.toEqual(dashboard);
    expect(getMock).toHaveBeenCalledWith('/api/v1/reports/dashboard', {
      params: { month: '2024-03' },
    });
  });

  it('createCategory posts the payload', async () => {
    const category = { id: 1, name: 'Food' };
    const input = {
      name: 'Food',
      type: 'expense' as const,
      is_tuition: false,
      is_other: false,
    };
    postMock.mockResolvedValue({ data: { data: category } });

    await expect(service.createCategory(input)).resolves.toEqual(category);
    expect(postMock).toHaveBeenCalledWith('/api/v1/categories', input);
  });

  it('updateCategory patches the category', async () => {
    const category = { id: 1, name: 'Food' };
    const input = {
      name: 'Groceries',
      type: 'expense' as const,
      is_tuition: false,
      is_other: false,
    };
    patchMock.mockResolvedValue({ data: { data: category } });

    await expect(service.updateCategory('1', input)).resolves.toEqual(category);
    expect(patchMock).toHaveBeenCalledWith('/api/v1/categories/1', input);
  });

  it('deleteCategory deletes the category', async () => {
    deleteMock.mockResolvedValue({});

    await service.deleteCategory('1');

    expect(deleteMock).toHaveBeenCalledWith('/api/v1/categories/1');
  });

  it('createUser posts the payload with a password confirmation', async () => {
    const created = { id: 2, name: 'User' };
    const input = {
      name: 'User',
      email: 'u@x.com',
      password: 'pw',
      password_confirmation: 'pw',
    };
    postMock.mockResolvedValue({ data: { data: created } });

    await expect(service.createUser(input)).resolves.toEqual(created);
    expect(postMock).toHaveBeenCalledWith('/api/v1/users', input);
  });
});
