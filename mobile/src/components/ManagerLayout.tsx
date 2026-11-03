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
  icon: React.ReactNode;
}[] = [
  { id: 'recurring', label: 'Recurring', icon: <Repeat size={20} color="#64748b" /> },
  { id: 'charity', label: 'Charity', icon: <Heart size={20} color="#64748b" /> },
  { id: 'others', label: 'Others', icon: <LayoutGrid size={20} color="#64748b" /> },
  { id: 'create-user', label: 'Create User', icon: <UserPlus size={20} color="#64748b" /> },
  { id: 'activity-logs', label: 'Activity Logs', icon: <FileText size={20} color="#64748b" /> },
];

export default function ManagerLayout() {
  const { activeTab, setActiveTab, signOut } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
  const isMoreActive = moreTabs.some((tab) => tab.id === activeTab);

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

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <View className="flex-row items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3.5">
        <View className="flex-row items-center gap-2.5">
          <View className="h-8 w-8 items-center justify-center rounded-full border border-white">
            <Text className="text-[11px] font-extrabold text-white">RM</Text>
          </View>
          <View>
            <Text className="text-[11px] font-extrabold tracking-[0.8px] text-white">RENTAL EXPENSE</Text>
            <Text className="text-[9px] font-bold tracking-[1.2px] text-slate-400">MANAGER</Text>
          </View>
        </View>

        <View className="relative">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Account menu"
            accessibilityState={{ expanded: isAccountMenuOpen }}
            onPress={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
            className="h-8 w-8 items-center justify-center rounded-full bg-blue-700"
            activeOpacity={0.8}
          >
            <Text className="text-[13px] font-bold text-white">M</Text>
          </TouchableOpacity>
        </View>
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
                  className={`mt-[3px] text-center text-[10px] font-semibold ${isActive ? 'font-extrabold text-blue-700' : 'text-slate-500'}`}
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
            onPress={() => setIsMoreOpen(true)}
            className={`min-w-0 flex-1 items-center justify-center rounded-[10px] px-1 py-1 ${isMoreActive ? 'bg-blue-50' : ''}`}
            activeOpacity={0.7}
          >
            <MoreHorizontal size={20} color={isMoreActive ? '#2563eb' : '#94a3b8'} />
            <Text
              className={`mt-[3px] text-center text-[10px] font-semibold ${isMoreActive ? 'font-extrabold text-blue-700' : 'text-slate-500'}`}
            >
              More
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isAccountMenuOpen && (
        <View className="absolute inset-0 z-50">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close account menu"
            onPress={() => setIsAccountMenuOpen(false)}
            className="absolute inset-0"
          />
          <View className="absolute right-4 top-[54px] min-w-[140px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              onPress={() => {
                setIsAccountMenuOpen(false);
                void handleSignOut();
              }}
              className="flex-row items-center gap-2 rounded-lg px-3 py-2.5"
              activeOpacity={0.7}
            >
              <LogOut size={16} color="#475569" />
              <Text className="text-sm font-semibold text-slate-700">Log out</Text>
            </TouchableOpacity>
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
            className="rounded-t-3xl bg-white px-5 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-slate-300" />
            <Text className="mb-2 text-lg font-bold text-slate-900">More</Text>
            {moreTabs.map((tab) => {
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
                  className={`flex-row items-center gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-blue-50' : ''}`}
                  activeOpacity={0.7}
                >
                  {tab.icon}
                  <Text className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
