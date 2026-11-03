import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import {
  Transaction,
  Category,
  RecurringTransaction,
  ActivityLog,
  UserAccount,
  NavTab,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_RECURRING,
  INITIAL_TRANSACTIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_USERS,
} from '../data/initialData';
import {
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
} from '../services/api';
import { clearAccessToken, getAccessToken } from '../services/axios';
import type { ApiUser } from '../services/types';
import { isAxiosError } from 'axios';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserAccount;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  transactions: Transaction[];
  categories: Category[];
  recurring: RecurringTransaction[];
  activityLogs: ActivityLog[];
  users: UserAccount[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'addedBy'>) => void;
  deleteTransaction: (id: string) => void;
  deleteRecurring: (id: string) => void;
  addUser: (name: string, email: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function toUserAccount(user: Pick<ApiUser, 'id' | 'name' | 'email' | 'user_type'>): UserAccount {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    createdAt: new Date().toISOString().split('T')[0],
    role: user.user_type === 'admin' ? 'Admin' : 'Standard',
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(INITIAL_RECURRING);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          try {
            const response = await apiMe();
            if (isActive) {
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
          setAuthError(`Unable to verify your saved session. ${message}`);
        }
      } finally {
        if (isActive) setIsAuthLoading(false);
      }
    };

    void restoreSession();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    AsyncStorage.multiGet([
      'rem_transactions',
      'rem_categories',
      'rem_recurring',
      'rem_logs',
      'rem_users_list',
    ])
      .then((entries) => {
        if (!isActive) return;

        const storedValues = new Map(entries);
        const readStored = <T,>(key: string, fallback: T): T => {
          const value = storedValues.get(key);
          return value ? (JSON.parse(value) as T) : fallback;
        };

        setTransactions(readStored('rem_transactions', INITIAL_TRANSACTIONS));
        setCategories(readStored('rem_categories', INITIAL_CATEGORIES));
        setRecurring(readStored('rem_recurring', INITIAL_RECURRING));
        setActivityLogs(readStored('rem_logs', INITIAL_ACTIVITY_LOGS));
        setUsers(readStored('rem_users_list', INITIAL_USERS));
        setIsHydrated(true);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const message = error instanceof Error ? error.message : String(error);
        console.error('Unable to load saved rental data.', error);
        setStorageError(message);
        setIsHydrated(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || storageError) return;

    AsyncStorage.multiSet([
      ['rem_transactions', JSON.stringify(transactions)],
      ['rem_categories', JSON.stringify(categories)],
      ['rem_recurring', JSON.stringify(recurring)],
      ['rem_logs', JSON.stringify(activityLogs)],
      ['rem_users_list', JSON.stringify(users)],
    ]).catch((error: unknown) => {
      console.error('Unable to save rental data.', error);
      Alert.alert(
        'Unable to save changes',
        error instanceof Error ? error.message : String(error),
      );
    });
  }, [
    activityLogs,
    categories,
    isHydrated,
    recurring,
    storageError,
    transactions,
    users,
  ]);

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    const formattedTime = now.toTimeString().split(' ')[0];
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: `${formattedDate} ${formattedTime}`,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'addedBy'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      addedBy: currentUser.name,
    };
    setTransactions((prev) => [newTx, ...prev]);
    addActivityLog({
      user: currentUser.name,
      email: currentUser.email,
      action: 'Create Transaction',
      description: `Created transaction "${tx.description}" (${tx.type}) for ₱${tx.amount.toLocaleString()}`,
      ipAddress: '127.0.0.1',
      details: { method: 'POST', url: '/api/v1/transactions', payload: tx, status: '201 Created' },
    });
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      addActivityLog({
        user: currentUser.name,
        email: currentUser.email,
        action: 'Delete Transaction',
        description: `Deleted transaction "${target.description}"`,
        ipAddress: '127.0.0.1',
        details: { method: 'DELETE', url: `/api/v1/transactions/${id}`, status: '200 OK' },
      });
    }
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  const addUser = (name: string, email: string) => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString().split('T')[0],
      role: 'Standard',
    };
    setUsers((prev) => [...prev, newUser]);
    addActivityLog({
      user: currentUser.name,
      email: currentUser.email,
      action: 'Create User',
      description: `Created new standard user: ${name} (${email})`,
      ipAddress: '127.0.0.1',
      details: { method: 'POST', url: '/api/v1/users', payload: { name, email }, status: '201 Created' },
    });
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    const response = await apiLogin({ email, password });
    setCurrentUser(toUserAccount(response.user));
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    try {
      await apiLogout();
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(INITIAL_USERS[0]);
    }
  };

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator />
        <Text>Loading rental data...</Text>
      </View>
    );
  }

  if (storageError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ textAlign: 'center', color: '#b91c1c' }}>
          Unable to load saved rental data. Restart the app or reinstall it if this continues.
          {'\n\n'}
          {storageError}
        </Text>
      </View>
    );
  }

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
        transactions,
        categories,
        recurring,
        activityLogs,
        users,
        addTransaction,
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
