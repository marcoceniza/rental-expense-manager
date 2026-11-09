import React from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FileSpreadsheet,
  FileText,
  Heart,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  ChevronRight,
  X,
  PieChart,
  Repeat,
  Tag,
  UserPlus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import type { NavTab } from '@/types';
import ActivityLogsScreen from '@/screens/ActivityLogsScreen';
import CategoriesScreen from '@/screens/CategoriesScreen';
import CharityScreen from '@/screens/CharityScreen';
import CreateUserScreen from '@/screens/CreateUserScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import OthersScreen from '@/screens/OthersScreen';
import RecurringScreen from '@/screens/RecurringScreen';
import ReportsScreen from '@/screens/ReportsScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';

const primaryTabs: {
  id: NavTab;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: (active) => <LayoutDashboard size={20} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'transactions', label: 'Transactions', icon: (active) => <FileSpreadsheet size={20} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'reports', label: 'Reports', icon: (active) => <PieChart size={20} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'categories', label: 'Categories', icon: (active) => <Tag size={20} color={active ? '#2563eb' : '#94a3b8'} /> },
];

const moreTabs: {
  id: NavTab;
  label: string;
  description: string;
  icon: (color: string) => React.ReactNode;
  color: string;
  backgroundColor: string;
}[] = [
  {
    id: 'recurring',
    label: 'Recurring',
    description: 'Manage scheduled transactions',
    icon: (color) => <Repeat size={20} color={color} />,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  {
    id: 'charity',
    label: 'Charity',
    description: 'View tuition and education support',
    icon: (color) => <Heart size={20} color={color} />,
    color: '#e11d48',
    backgroundColor: '#fff1f2',
  },
  {
    id: 'others',
    label: 'Others',
    description: 'Review other transactions',
    icon: (color) => <LayoutGrid size={20} color={color} />,
    color: '#7c3aed',
    backgroundColor: '#f5f3ff',
  },
  {
    id: 'create-user',
    label: 'Create User',
    description: 'Add a standard user account',
    icon: (color) => <UserPlus size={20} color={color} />,
    color: '#0891b2',
    backgroundColor: '#ecfeff',
  },
  {
    id: 'activity-logs',
    label: 'Activity Logs',
    description: 'Track account and system activity',
    icon: (color) => <FileText size={20} color={color} />,
    color: '#d97706',
    backgroundColor: '#fffbeb',
  },
];

export default function ManagerLayout() {
  const { activeTab, setActiveTab, signOut, currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const [isAccountOpen, setIsAccountOpen] = React.useState(false);
  const [headerTop, setHeaderTop] = React.useState(0);
  const [accountButtonBottom, setAccountButtonBottom] = React.useState(0);
  const visibleMoreTabs = currentUser?.role === 'Admin'
    ? moreTabs
    : moreTabs.filter((tab) => !['create-user', 'activity-logs', 'others'].includes(tab.id));
  const isMoreActive = visibleMoreTabs.some((tab) => tab.id === activeTab);

  const screens: Record<NavTab, React.ReactNode> = {
    dashboard: <DashboardScreen />,
    transactions: <TransactionsScreen />,
    reports: <ReportsScreen />,
    charity: <CharityScreen />,
    recurring: <RecurringScreen />,
    categories: <CategoriesScreen />,
    others: <OthersScreen />,
    'create-user': <CreateUserScreen />,
    'activity-logs': <ActivityLogsScreen />,
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: unknown) {
      Alert.alert(
        'Signed out locally',
        error instanceof Error
          ? `The server could not end the session: ${error.message}`
          : 'The server could not end the session.',
      );
    } finally {
      router.replace('/login');
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Log out?', 'You will need to sign in again to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          setIsMoreOpen(false);
          void handleSignOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <View
        onLayout={(event) => setHeaderTop(event.nativeEvent.layout.y)}
        className="flex-row items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-4"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full border border-white">
            <Text className="text-[16px] font-extrabold text-white">RM</Text>
          </View>
          <View>
            <Text className="text-[16px] font-extrabold tracking-[0.8px] text-white">RENTAL EXPENSE</Text>
            <Text className="text-[13px] font-bold tracking-[1.2px] text-slate-400">MANAGER</Text>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Account information"
          accessibilityState={{ expanded: isAccountOpen }}
          onPress={() => setIsAccountOpen((open) => !open)}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setAccountButtonBottom(y + height);
          }}
          className="h-10 w-10 items-center justify-center rounded-full bg-blue-700"
          activeOpacity={0.75}
        >
            <Text className="text-[18px] font-bold text-white">
              {currentUser?.name.trim().charAt(0).toUpperCase() || 'U'}
            </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-slate-50">{screens[activeTab]}</View>

      <View
        className="border-t border-slate-200 bg-white"
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="flex-row items-center px-1 py-2">
          {primaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveTab(tab.id)}
                className={`min-w-0 flex-1 items-center justify-center rounded-[10px] px-1 py-1 ${isActive ? 'bg-blue-50' : ''}`}
                activeOpacity={0.7}
              >
                {tab.icon(isActive)}
                <Text
                  numberOfLines={1}
                  className={`mt-[3px] text-center text-[12px] font-semibold ${isActive ? 'font-extrabold text-blue-700' : 'text-slate-500'}`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: isMoreActive }}
            accessibilityLabel="More tabs"
            onPress={() => {
              setIsAccountOpen(false);
              setIsMoreOpen(true);
            }}
            className={`min-w-0 flex-1 items-center justify-center rounded-[10px] px-1 py-1 ${isMoreActive ? 'bg-blue-50' : ''}`}
            activeOpacity={0.7}
          >
            <MoreHorizontal size={20} color={isMoreActive ? '#2563eb' : '#94a3b8'} />
            <Text
              className={`mt-[3px] text-center text-[12px] font-semibold ${isMoreActive ? 'font-extrabold text-blue-700' : 'text-slate-500'}`}
            >
              More
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isAccountOpen && (
        <View className="absolute inset-0 z-50">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close account information"
            onPress={() => setIsAccountOpen(false)}
            className="absolute inset-0 bg-black/25"
          />
          <View
            className="absolute right-4 w-[90%] max-w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            style={{ top: headerTop + accountButtonBottom }}
          >
            <View className="mb-3 flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-700">
                <Text className="text-lg font-bold text-white">
                  {currentUser?.name.trim().charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                  {currentUser?.name ?? 'User'}
                </Text>
                <Text className="mt-0.5 text-[13px] font-semibold text-blue-700">
                  {currentUser?.role ?? 'User'}
                </Text>
              </View>
            </View>
            <View className="border-t border-slate-100 pt-3">
              <Text className="mb-1 text-[12px] font-bold uppercase tracking-wide text-slate-400">
                Email
              </Text>
              <Text className="text-[14px] leading-5 text-slate-700">
                {currentUser?.email ?? ''}
              </Text>
            </View>
          </View>
        </View>
      )}

      <Modal
        visible={isMoreOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMoreOpen(false)}
      >
        <View className="flex-1 justify-end">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Close more tabs menu"
            onPress={() => setIsMoreOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <View
            className="rounded-t-3xl bg-slate-50 px-5 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-slate-300" />
            <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-slate-950 p-4">
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <MoreHorizontal size={23} color="#ffffff" />
                </View>
                <View>
                  <Text className="text-lg font-extrabold text-white">More options</Text>
                  <Text className="mt-0.5 text-[13px] text-slate-300">Explore other sections</Text>
                </View>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close more tabs menu"
                onPress={() => setIsMoreOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
                activeOpacity={1}
              >
                <X size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View className="gap-2">
              {visibleMoreTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => {
                      setActiveTab(tab.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex-row items-center gap-3 rounded-2xl border bg-white p-3 ${isActive ? 'border-blue-300' : 'border-slate-200'}`}
                    activeOpacity={1}
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: tab.backgroundColor }}
                    >
                      {tab.icon(tab.color)}
                    </View>
                    <View className="flex-1">
                      <Text className={`text-[15px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-900'}`}>
                        {tab.label}
                      </Text>
                      <Text className="mt-0.5 text-[13px] text-slate-500">
                        {tab.description}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={isActive ? '#2563eb' : '#94a3b8'} />
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="my-4 h-px bg-slate-200" />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={confirmSignOut}
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5"
              activeOpacity={1}
            >
              <LogOut size={18} color="#dc2626" />
              <Text className="text-[15px] font-bold text-red-700">Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
