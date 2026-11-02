import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
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
  PieChart,
  Repeat,
  Tag,
  UserPlus,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { NavTab } from '@/types';
import ActivityLogsScreen from '@/screens/ActivityLogsScreen';
import CategoriesScreen from '@/screens/CategoriesScreen';
import CharityScreen from '@/screens/CharityScreen';
import CreateUserScreen from '@/screens/CreateUserScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import OthersScreen from '@/screens/OthersScreen';
import RecurringScreen from '@/screens/RecurringScreen';
import ReportsScreen from '@/screens/ReportsScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';

const tabs: {
  id: NavTab;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: (active) => <LayoutDashboard size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'transactions', label: 'Transactions', icon: (active) => <FileSpreadsheet size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'reports', label: 'Reports', icon: (active) => <PieChart size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'charity', label: 'Charity', icon: (active) => <Heart size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'recurring', label: 'Recurring', icon: (active) => <Repeat size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'categories', label: 'Categories', icon: (active) => <Tag size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'others', label: 'Others', icon: (active) => <LayoutGrid size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'create-user', label: 'Create User', icon: (active) => <UserPlus size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
  { id: 'activity-logs', label: 'Logs', icon: (active) => <FileText size={16} color={active ? '#2563eb' : '#94a3b8'} /> },
];

export default function ManagerLayout() {
  const { activeTab, setActiveTab, currentUser } = useApp();
  const insets = useSafeAreaInsets();

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

  return (
    <SafeAreaView
      className="flex-1 bg-slate-950"
      edges={['top', 'left', 'right']}
      style={styles.safeArea}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoCircleText}>RM</Text>
          </View>
          <View>
            <Text style={styles.logoTitle}>RENTAL EXPENSE</Text>
            <Text style={styles.logoSub}>MANAGER</Text>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open activity logs"
          onPress={() => setActiveTab('activity-logs')}
          style={styles.userBadge}
          activeOpacity={0.8}
        >
          <Text style={styles.userInitial}>{currentUser.name.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-slate-50" style={styles.screenBody}>
        {screens[activeTab]}
      </View>

      <View
        className="border-t border-slate-200 bg-white"
        style={[styles.bottomTabBarContainer, { paddingBottom: insets.bottom }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bottomTabBar}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                  {tab.icon(isActive)}
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0c1427',
  },
  topBar: {
    backgroundColor: '#0c1427',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  logoTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  logoSub: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  userBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a56db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  screenBody: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomTabBarContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  bottomTabBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 68,
  },
  tabItemActive: {
    backgroundColor: '#eff6ff',
  },
  tabIconWrap: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#1a56db',
    fontWeight: '800',
  },
});
