export type TransactionType = 'INCOME' | 'EXPENSE' | 'LIABILITY';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD or display formatted
  transactionDate: string;
  categoryId: string;
  deletedAt?: string;
  description: string;
  subDescription?: string;
  category: string;
  amount: number;
  type: TransactionType;
  addedBy: string;
  isCharity?: boolean;
  isOther?: boolean;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isCharity?: boolean;
  isOther?: boolean;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  categoryId: string;
  category: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  action: string;
  description: string;
  ipAddress: string;
  details?: {
    userAgent?: string;
    method?: string;
    url?: string;
    payload?: Record<string, any>;
    status?: string;
  };
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: 'Admin' | 'Standard';
}

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'reports'
  | 'charity'
  | 'recurring'
  | 'categories'
  | 'others'
  | 'create-user'
  | 'activity-logs';
