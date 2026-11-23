import type {
  ActivityLog,
  Category,
  NavTab,
  RecurringTransaction,
  Transaction,
  TransactionType,
  UserAccount,
} from '@/types';

// Compile-time smoke tests: each literal must satisfy its exported interface.
const transactionType: TransactionType = 'INCOME';
const transaction: Transaction = {
  id: '1',
  date: 'Jan 15, 2024',
  transactionDate: '2024-01-15',
  categoryId: '5',
  description: 'Lunch',
  subDescription: 'with client',
  category: 'Food',
  amount: 25.5,
  type: transactionType,
  addedBy: 'Admin',
  isCharity: false,
  isOther: false,
};
const category: Category = {
  id: '5',
  name: 'Food',
  type: 'EXPENSE',
  isOther: false,
  transactionsCount: 3,
};
const recurring: RecurringTransaction = {
  id: '7',
  title: 'Rent',
  categoryId: '5',
  category: 'Housing',
  amount: 500,
  frequency: 'monthly',
  startDate: '2024-01-01',
};
const log: ActivityLog = {
  id: '1',
  timestamp: '2024-01-15T10:00:00Z',
  user: 'Admin',
  email: 'admin@example.com',
  action: 'login',
  description: 'signed in',
  ipAddress: '127.0.0.1',
  details: { userAgent: 'jest', payload: { ok: true } },
};
const user: UserAccount = {
  id: '1',
  name: 'Admin',
  email: 'admin@example.com',
  createdAt: '2024-01-01',
  role: 'Admin',
};
const tab: NavTab = 'dashboard';

describe('types/index compile-time smoke tests', () => {
  it('exposes shape-compatible domain types at runtime', () => {
    expect(transaction.type).toBe('INCOME');
    expect(transaction.amount).toBe(25.5);
    expect(category.name).toBe('Food');
    expect(category.transactionsCount).toBe(3);
    expect(recurring.frequency).toBe('monthly');
    expect(log.action).toBe('login');
    expect(user.role).toBe('Admin');
    expect(tab).toBe('dashboard');
  });
});
