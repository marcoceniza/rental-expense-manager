import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  Category,
  RecurringTransaction,
  ActivityLog,
  UserAccount,
  NavTab,
} from '../types';
import {
  createCategory as createCategoryRequest,
  createRecurring as createRecurringRequest,
  createTransaction as createTransactionRequest,
  createUser as createUserRequest,
  deleteCategory as deleteCategoryRequest,
  deleteRecurring as deleteRecurringRequest,
  deleteTransaction as deleteTransactionRequest,
  getActivityLogs,
  getCategories,
  getCharityTransactions,
  getOtherTransactions,
  getPaginatedTransactions,
  getRecurringTransactions,
  getTrashedTransactions,
  getUsers,
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  permanentlyDeleteTransaction as permanentlyDeleteTransactionRequest,
  restoreTransaction as restoreTransactionRequest,
  updateCategory as updateCategoryRequest,
  updateRecurring as updateRecurringRequest,
  updateTransaction as updateTransactionRequest,
} from '../services/api';
import { clearAccessToken, getAccessToken } from '../services/axios';
import type {
  ApiCategory,
  ApiLog,
  ApiRecurring,
  ApiTransaction,
  ApiUser,
  ApiUserAccount,
} from '../services/types';
import { isAxiosError } from 'axios';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchCharityTransactions: (year: number) => Promise<Transaction[]>;
  fetchOtherTransactions: (year: number) => Promise<Transaction[]>;
  transactions: Transaction[];
  transactionsLastPage: number;
  trashedTransactions: Transaction[];
  loadTrashedTransactions: () => Promise<void>;
  restoreTransaction: (id: string) => Promise<void>;
  permanentlyDeleteTransaction: (id: string) => Promise<void>;
  categories: Category[];
  recurring: RecurringTransaction[];
  activityLogs: ActivityLog[];
  users: UserAccount[];
  addTransaction: (tx: {
    category_id: number;
    type: 'income' | 'expense' | 'liability';
    amount: number;
    transaction_date: string;
    description: string;
    remarks?: string;
  }) => Promise<void>;
  updateTransaction: (id: string, tx: Parameters<AppContextType['addTransaction']>[0]) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  resetTransactions: () => Promise<void>;
  addCategory: (category: {
    name: string;
    type: 'income' | 'expense' | 'liability';
    is_tuition: boolean;
    is_other: boolean;
  }) => Promise<void>;
  updateCategory: (id: string, category: Parameters<AppContextType['addCategory']>[0]) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addRecurring: (recurring: {
    category_id: number;
    amount: number;
    frequency: 'monthly';
    start_date: string;
    description: string;
  }) => Promise<void>;
  updateRecurring: (id: string, recurring: Parameters<AppContextType['addRecurring']>[0]) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  addUser: (name: string, email: string, password: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function toUserAccount(
  user: Pick<ApiUser, 'id' | 'name' | 'email' | 'user_type' | 'created_at'>,
): UserAccount {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    createdAt: user.created_at?.slice(0, 10) ?? '',
    role: user.user_type === 'admin' ? 'Admin' : 'Standard',
  };
}

function formatTransactionDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function toTransaction(transaction: ApiTransaction): Transaction {
  const category = transaction.category;
  return {
    id: String(transaction.id),
    date: formatTransactionDate(transaction.transaction_date),
    transactionDate: transaction.transaction_date.slice(0, 10),
    categoryId: String(transaction.category_id),
    deletedAt: transaction.deleted_at ?? undefined,
    description: transaction.description,
    subDescription: transaction.remarks ?? undefined,
    category: category?.name ?? 'Uncategorized',
    amount: Number(transaction.amount),
    type: transaction.type === 'income'
      ? 'INCOME'
      : transaction.type === 'expense'
        ? 'EXPENSE'
        : 'LIABILITY',
    addedBy: transaction.user?.name ?? 'System',
    isCharity: category?.is_tuition ?? false,
    isOther: category?.is_other ?? false,
  };
}

function toCategory(category: ApiCategory): Category {
  return {
    id: String(category.id),
    name: category.name,
    type: category.type === 'income'
      ? 'INCOME'
      : category.type === 'expense'
        ? 'EXPENSE'
        : 'LIABILITY',
    isCharity: category.is_tuition,
    isOther: category.is_other,
    transactionsCount: category.transactions_count ?? 0,
  };
}

function toRecurring(recurring: ApiRecurring): RecurringTransaction {
  return {
    id: String(recurring.id),
    title: recurring.description,
    categoryId: String(recurring.category_id),
    category: recurring.category?.name ?? 'Uncategorized',
    amount: Number(recurring.amount),
    frequency: recurring.frequency,
    startDate: recurring.start_date.slice(0, 10),
  };
}

function toActivityLog(log: ApiLog): ActivityLog {
  return {
    id: String(log.id),
    timestamp: new Date(log.created_at).toLocaleString(),
    user: log.user_name,
    email: log.user_email ?? '',
    action: log.action,
    description: log.description ?? '',
    ipAddress: log.ip_address ?? '',
    details: {
      userAgent: log.user_agent ?? undefined,
      payload: log.payload ?? undefined,
    },
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsLastPage, setTransactionsLastPage] = useState(1);
  const [trashedTransactions, setTrashedTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);

  const fetchCharityTransactions = useCallback(async (year: number) => {
    const data = await getCharityTransactions(year);
    return data.map(toTransaction);
  }, []);

  const fetchOtherTransactions = useCallback(async (year: number) => {
    const data = await getOtherTransactions(year);
    return data.map(toTransaction);
  }, []);

  const loadRemoteData = useCallback(async (user: ApiUser) => {
    let apiUsers: ApiUserAccount[] = [];
    let apiLogs: ApiLog[] = [];
    let apiTrashedTransactions: ApiTransaction[] = [];
    const [apiCategories, paginated, apiRecurring] = await Promise.all([
      getCategories(),
      getPaginatedTransactions(1),
      getRecurringTransactions(),
    ]);
    if (user.user_type === 'admin') {
      [apiUsers, apiLogs, apiTrashedTransactions] = await Promise.all([
        getUsers(),
        getActivityLogs(),
        getTrashedTransactions(),
      ]);
    }

    setCategories(apiCategories.map(toCategory));
    setTransactionsLastPage(paginated.last_page);
    setTransactionsPage(1);
    setTransactions(paginated.data.map(toTransaction));
    setTrashedTransactions(apiTrashedTransactions.map(toTransaction));
    setRecurring(apiRecurring.map(toRecurring));
    setUsers(apiUsers.map(toUserAccount));
    setActivityLogs(apiLogs.map(toActivityLog));
  }, []);

  const loadMoreTransactions = useCallback(async () => {
    const nextPage = transactionsPage + 1;
    if (nextPage > transactionsLastPage) return;

    const { data: newItems, last_page: totalLastPage } = await getPaginatedTransactions(nextPage);
    const mapped = newItems.map(toTransaction);
    setTransactions((prev) => [...prev, ...mapped]);
    setTransactionsPage(nextPage);
    setTransactionsLastPage(totalLastPage);
  }, [transactionsPage, transactionsLastPage]);

  const resetTransactions = useCallback(async () => {
    const { data: newItems, last_page: totalLastPage } = await getPaginatedTransactions(1);
    setTransactions(newItems.map(toTransaction));
    setTransactionsPage(1);
    setTransactionsLastPage(totalLastPage);
  }, []);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          try {
            const response = await apiMe();
            if (isActive) {
              await loadRemoteData(response.user);
              setCurrentUser(toUserAccount(response.user));
              setIsAuthenticated(true);
            }
          } catch (error: unknown) {
            if (isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
              await clearAccessToken();
            } else {
              throw error;
            }
          }
        }
      } catch (error: unknown) {
        if (isActive) {
          const message = error instanceof Error ? error.message : String(error);
          console.error('Unable to restore the saved login session.', error);
          setAuthError(`Unable to restore your session or load account data. ${message}`);
        }
      } finally {
        if (isActive) setIsAuthLoading(false);
      }
    };

    void restoreSession();
    return () => {
      isActive = false;
    };
  }, [loadRemoteData]);

  const addTransaction = async (tx: Parameters<AppContextType['addTransaction']>[0]) => {
    const created = await createTransactionRequest(tx);
    setTransactions((prev) => [toTransaction(created), ...prev]);
  };

  const updateTransaction = async (id: string, tx: Parameters<AppContextType['addTransaction']>[0]) => {
    const updated = await updateTransactionRequest(id, tx);
    setTransactions((prev) => prev.map((transaction) =>
      transaction.id === id ? toTransaction(updated) : transaction,
    ));
  };

  const loadTrashedTransactions = async () => {
    const trashed = await getTrashedTransactions();
    setTrashedTransactions(trashed.map(toTransaction));
  };

  const restoreTransaction = async (id: string) => {
    const restored = await restoreTransactionRequest(id);
    const mapped = toTransaction(restored);
    setTrashedTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    setTransactions((prev) => [mapped, ...prev.filter((transaction) => transaction.id !== id)]);
  };

  const permanentlyDeleteTransaction = async (id: string) => {
    await permanentlyDeleteTransactionRequest(id);
    setTrashedTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  };

  const addCategory = async (category: Parameters<AppContextType['addCategory']>[0]) => {
    const created = await createCategoryRequest(category);
    setCategories((prev) => [...prev, toCategory(created)]);
  };

  const updateCategory = async (id: string, category: Parameters<AppContextType['addCategory']>[0]) => {
    const updated = await updateCategoryRequest(id, category);
    setCategories((prev) => prev.map((item) => item.id === id ? toCategory(updated) : item));
    setTransactions((prev) => prev.map((transaction) => transaction.categoryId === id
      ? {
          ...transaction,
          category: updated.name,
          isCharity: updated.is_tuition,
          isOther: updated.is_other,
        }
      : transaction,
    ));
    setRecurring((prev) => prev.map((item) => item.categoryId === id
        ? { ...item, category: updated.name }
        : item,
    ));
  };

  const deleteCategory = async (id: string) => {
    await deleteCategoryRequest(id);
    setCategories((prev) => prev.filter((item) => item.id !== id));
  };

  const addRecurring = async (item: Parameters<AppContextType['addRecurring']>[0]) => {
    const created = await createRecurringRequest(item);
    setRecurring((prev) => [toRecurring(created), ...prev]);
  };

  const updateRecurring = async (id: string, item: Parameters<AppContextType['addRecurring']>[0]) => {
    const updated = await updateRecurringRequest(id, item);
    setRecurring((prev) => prev.map((recurringItem) =>
      recurringItem.id === id ? toRecurring(updated) : recurringItem,
    ));
  };

  const deleteTransaction = async (id: string) => {
    const deleted = transactions.find((transaction) => transaction.id === id);
    await deleteTransactionRequest(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (deleted) {
      setTrashedTransactions((prev) => [
        { ...deleted, deletedAt: new Date().toISOString() },
        ...prev.filter((transaction) => transaction.id !== id),
      ]);
    }
  };

  const deleteRecurring = async (id: string) => {
    await deleteRecurringRequest(id);
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  const addUser = async (name: string, email: string, password: string) => {
    const created = await createUserRequest({
      name,
      email,
      password,
      password_confirmation: password,
    });
    setUsers((prev) => [...prev, toUserAccount(created)]);
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    const response = await apiLogin({ email, password });
    try {
      await loadRemoteData(response.user);
      setCurrentUser(toUserAccount(response.user));
      setIsAuthenticated(true);
    } catch (error: unknown) {
      await clearAccessToken();
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiLogout();
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setTransactions([]);
      setTrashedTransactions([]);
      setCategories([]);
      setRecurring([]);
      setActivityLogs([]);
      setUsers([]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        isAuthenticated,
        isAuthLoading,
        authError,
        signIn,
        signOut,
        fetchCharityTransactions,
        fetchOtherTransactions,
        transactions,
        trashedTransactions,
        loadTrashedTransactions,
        restoreTransaction,
        permanentlyDeleteTransaction,
        categories,
        recurring,
        activityLogs,
        users,
        transactionsLastPage,
        loadMoreTransactions,
        resetTransactions,
        addTransaction,
        updateTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addRecurring,
        updateRecurring,
        deleteTransaction,
        deleteRecurring,
        addUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
