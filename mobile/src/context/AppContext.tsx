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

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  transactions: Transaction[];
  categories: Category[];
  recurring: RecurringTransaction[];
  activityLogs: ActivityLog[];
  users: UserAccount[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'addedBy'>) => void;
  deleteTransaction: (id: string) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  deleteRecurring: (id: string) => void;
  addUser: (name: string, email: string) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  viewMode: 'desktop' | 'mobile-preview' | 'responsive';
  setViewMode: (mode: 'desktop' | 'mobile-preview' | 'responsive') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile-preview' | 'responsive'>('responsive');
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(INITIAL_RECURRING);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    AsyncStorage.multiGet([
      'rem_user',
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

        setCurrentUser(readStored('rem_user', INITIAL_USERS[0]));
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
      ['rem_user', JSON.stringify(currentUser)],
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
    currentUser,
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

  const bulkDeleteTransactions = (ids: string[]) => {
    setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
    addActivityLog({
      user: currentUser.name,
      email: currentUser.email,
      action: 'Delete Transaction',
      description: `Bulk deleted ${ids.length} transactions`,
      ipAddress: '127.0.0.1',
      details: { method: 'POST', url: '/api/v1/transactions/bulk-delete', status: '200 OK' },
    });
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [newCat, ...prev]);
    addActivityLog({
      user: currentUser.name,
      email: currentUser.email,
      action: 'Create Category',
      description: `Created category "${cat.name}" [${cat.type}]`,
      ipAddress: '127.0.0.1',
      details: { method: 'POST', url: '/api/v1/categories', payload: cat, status: '201 Created' },
    });
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addRecurring = (rec: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...rec,
      id: `rec-${Date.now()}`,
    };
    setRecurring((prev) => [newRec, ...prev]);
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
        setCurrentUser,
        transactions,
        categories,
        recurring,
        activityLogs,
        users,
        addTransaction,
        deleteTransaction,
        bulkDeleteTransactions,
        addCategory,
        deleteCategory,
        addRecurring,
        deleteRecurring,
        addUser,
        addActivityLog,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        viewMode,
        setViewMode,
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
