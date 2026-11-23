import type {
  ApiAnnualReport,
  ApiCategory,
  ApiCategorySummary,
  ApiCollection,
  ApiDashboard,
  ApiFieldErrors,
  ApiLog,
  ApiRecurring,
  ApiReportTransactionCollection,
  ApiTransaction,
  ApiTransactionType,
  ApiUser,
  ApiUserAccount,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from '@/services/types';

// Compile-time smoke tests: each literal must satisfy its exported interface.
const user: ApiUser = {
  id: 1,
  name: 'Admin',
  email: 'admin@example.com',
  user_type: 'admin',
  created_at: null,
};
const login: LoginResponse = { token: 'token', user };
const logout: LogoutResponse = { message: 'ok' };
const me: MeResponse = { user };
const fieldErrors: ApiFieldErrors = { email: ['required'], password: 'too short' };
const category: ApiCategory = {
  id: 5,
  name: 'Food',
  type: 'expense',
  is_tuition: false,
  is_other: false,
};
const transactionType: ApiTransactionType = 'income';
const transaction: ApiTransaction = {
  id: 10,
  category_id: 5,
  type: 'expense',
  amount: '25.50',
  transaction_date: '2024-03-15',
  description: 'Lunch',
  remarks: null,
  category,
  user,
};
const dashboard: ApiDashboard = {
  month: '2024-03',
  categories: [category],
  monthly_report: { income: 0, expense: 0, liability: 0, net: 0 },
  transactions: [transaction],
};
const recurring: ApiRecurring = {
  id: 7,
  category_id: 5,
  category,
  amount: 100,
  frequency: 'monthly',
  start_date: '2024-01-01',
  end_date: null,
  description: 'Rent',
};
const collection: ApiCollection<ApiTransaction> = {
  data: [transaction],
  meta: { last_page: 1 },
};
const reportCollection: ApiReportTransactionCollection = {
  transactions: [transaction],
  meta: { last_page: 1 },
};
const annual: ApiAnnualReport = {
  monthly: [],
  totals: { income: 0, expense: 0, liability: 0, net: 0 },
};
const summary: ApiCategorySummary = { categoryReport: [], year: 2024 };
const log: ApiLog = {
  id: 1,
  user_name: 'Admin',
  user_email: null,
  action: 'login',
  description: null,
  ip_address: null,
  user_agent: null,
  payload: null,
  created_at: '2024-03-15T10:00:00Z',
};
const account: ApiUserAccount = {
  ...user,
  created_at: '2024-01-01T00:00:00Z',
};

describe('services/types compile-time smoke tests', () => {
  it('exposes shape-compatible service types at runtime', () => {
    expect(login.token).toBe('token');
    expect(logout.message).toBe('ok');
    expect(me.user.id).toBe(1);
    expect(fieldErrors.email).toEqual(['required']);
    expect(transactionType).toBe('income');
    expect(transaction.category?.name).toBe('Food');
    expect(dashboard.month).toBe('2024-03');
    expect(recurring.frequency).toBe('monthly');
    expect(collection.meta.last_page).toBe(1);
    expect(reportCollection.transactions).toHaveLength(1);
    expect(annual.monthly).toEqual([]);
    expect(summary.year).toBe(2024);
    expect(log.action).toBe('login');
    expect(account.user_type).toBe('admin');
    expect(account.created_at).toBe('2024-01-01T00:00:00Z');
  });
});
