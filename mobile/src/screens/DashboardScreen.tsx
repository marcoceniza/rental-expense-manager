import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import {
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { StatCard, Card } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';
import { getDashboard } from '../services/api';
import type { ApiDashboard } from '../services/types';

export default function DashboardScreen() {
  const { setActiveTab, currentUser } = useApp();

  const isAdmin = currentUser?.role === 'Admin';
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [dashboard, setDashboard] = useState<ApiDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const monthParam = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
  const currentMonth = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    let active = true;
    getDashboard(monthParam)
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((error: unknown) => {
        if (active) {
          Alert.alert(
            'Unable to load dashboard',
            error instanceof Error ? error.message : 'Please try again.',
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [monthParam]);

  const changeMonth = (nextMonth: Date) => {
    const normalized = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    const nextMonthParam = `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, '0')}`;
    if (nextMonthParam === monthParam) return;

    setDashboard(null);
    setIsLoading(true);
    setSelectedMonth(normalized);
  };

  const monthlyReport = dashboard?.monthly_report;
  const totalIncome = Number(monthlyReport?.income ?? 0);
  const totalExpenses = Number(monthlyReport?.expense ?? 0);
  const totalLiabilities = Number(monthlyReport?.liability ?? 0);
  const netBalance = Number(monthlyReport?.net ?? 0);
  const totalVolume = totalIncome + totalExpenses + totalLiabilities;
  const monthTransactions = dashboard?.transactions ?? [];
  const circumference = 2 * Math.PI * 54;
  const chartSegments = [
    { label: 'Income', value: totalIncome, color: '#10b981' },
    { label: 'Expense', value: totalExpenses, color: '#ef4444' },
    { label: 'Liability', value: totalLiabilities, color: '#f59e0b' },
  ]
    .filter((segment) => segment.value > 0)
    .map((segment, index, segments) => ({
      ...segment,
      dashLength: (segment.value / totalVolume) * circumference,
      dashOffset:
        -(segments.slice(0, index).reduce((sum, previous) => sum + previous.value, 0) /
          totalVolume) *
        circumference,
    }));

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="gap-4 p-4">
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <LayoutGrid size={20} color="#1e293b" />
            <Text className="text-[25px] font-extrabold text-slate-900">Financial Overview</Text>
          </View>
          <Text className="text-[16px] text-slate-500">
            Track your income and expenses efficiently.
          </Text>

          {isAdmin && (
          <View className="mt-2.5 flex-row flex-wrap items-center gap-2.5">
            <TouchableOpacity
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5"
              onPress={() => changeMonth(new Date())}
            >
              <Text className="text-xs font-semibold text-slate-700">This Month</Text>
            </TouchableOpacity>

            <View className="flex-row items-center rounded-lg border border-slate-200 bg-white">
              <TouchableOpacity
                onPress={() => changeMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
                className="p-1.5"
              >
                <ChevronLeft size={16} color="#475569" />
              </TouchableOpacity>
              <Text className="px-2 text-xs font-semibold text-slate-700">{currentMonth}</Text>
              <TouchableOpacity
                onPress={() => changeMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
                className="p-1.5"
              >
                <ChevronRight size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
          )}
        </View>

        <View className="flex-row flex-wrap gap-3">
          <StatCard
            title="TOTAL INCOME"
            amount={isLoading && !dashboard ? '—' : formatCurrency(totalIncome)}
            icon={<TrendingUp size={20} color="#2563eb" />}
            iconBg="#eff6ff"
          />
          <StatCard
            title="TOTAL EXPENSES"
            amount={isLoading && !dashboard ? '—' : formatCurrency(totalExpenses)}
            icon={<TrendingDown size={20} color="#f43f5e" />}
            iconBg="#fef2f2"
          />
          <StatCard
            title="LIABILITIES"
            amount={isLoading && !dashboard ? '—' : formatCurrency(totalLiabilities)}
            icon={<CreditCard size={20} color="#f59e0b" />}
            iconBg="#fffbeb"
          />
          <StatCard
            title="NET BALANCE"
            amount={isLoading && !dashboard ? '—' : formatCurrency(netBalance)}
            icon={<Wallet size={20} color="#059669" />}
            iconBg="#ecfdf5"
          />
        </View>

        <View className="gap-4">
          <Card className="min-h-[260px] justify-between">
            <Text className="text-[18px] font-bold text-slate-900">Monthly Overview</Text>
            <View className="items-center justify-center py-6">
                {isLoading && !dashboard ? (
                  <View className="h-[140px] items-center justify-center gap-2">
                    <ActivityIndicator color="#2563eb" />
                    <Text className="text-[13px] text-slate-400">Loading monthly report...</Text>
                  </View>
                ) : (
                  <View className="h-[140px] w-[140px] items-center justify-center">
                    <Svg width={140} height={140} style={{ position: 'absolute' }}>
                      <Circle
                        cx={70}
                        cy={70}
                        r={54}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth={12}
                      />
                      {chartSegments.map((segment) => (
                        <Circle
                          key={segment.label}
                          cx={70}
                          cy={70}
                          r={54}
                          fill="none"
                          stroke={segment.color}
                          strokeWidth={12}
                          strokeDasharray={`${segment.dashLength} ${circumference}`}
                          strokeDashoffset={segment.dashOffset}
                          rotation={-90}
                          originX={70}
                          originY={70}
                        />
                      ))}
                    </Svg>
                    <Text className="text-center text-[16px] font-extrabold text-slate-900">
                      {formatCurrency(totalVolume)}
                    </Text>
                    <Text className="text-[13px] text-slate-400">Total Volume</Text>
                  </View>
                )}
            </View>

            <View className="flex-row justify-center gap-5 border-t border-slate-100 pt-3">
              {[
                { label: 'Income', color: '#10b981' },
                { label: 'Expense', color: '#ef4444' },
                { label: 'Liability', color: '#f59e0b' },
              ].map(({ label, color }) => (
                <View key={label} className="flex-row items-center gap-1.5">
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  <Text className="text-[14px] text-slate-600">{label}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card className="min-h-[260px]">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[18px] font-bold text-slate-900">Recent Activity</Text>
              <TouchableOpacity
                onPress={() => setActiveTab('transactions')}
                className="flex-row items-center gap-1"
              >
                <Text className="text-xs font-semibold text-blue-700">View All</Text>
                <ArrowRight size={14} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <View className="mb-1.5 flex-row rounded-md bg-slate-50 px-2 py-2">
              <Text className="text-[13px] font-bold tracking-[0.5px] text-slate-400" style={{ flex: 1.5 }}>DATE</Text>
              <Text className="text-[13px] font-bold tracking-[0.5px] text-slate-400" style={{ flex: 2.5 }}>DESCRIPTION</Text>
              {isAdmin && (
                <Text className="text-[13px] font-bold tracking-[0.5px] text-slate-400" style={{ flex: 1.5 }}>CATEGORY</Text>
              )}
              <Text className="text-right text-[13px] font-bold tracking-[0.5px] text-slate-400" style={{ flex: 2 }}>AMOUNT</Text>
            </View>

            {isLoading && !dashboard ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#2563eb" />
              </View>
            ) : monthTransactions.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-center text-xs italic text-slate-400">No transactions recorded yet.</Text>
              </View>
            ) : (
              <View className="gap-1.5">
                {monthTransactions.slice(0, 5).map((transaction) => {
                  const amountColor =
                    transaction.type === 'income'
                      ? '#16a34a'
                      : transaction.type === 'liability'
                        ? '#d97706'
                        : '#dc2626';
                  const formattedDate = new Date(`${transaction.transaction_date.slice(0, 10)}T00:00:00`)
                    .toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    });
                  return (
                    <View
                      key={transaction.id}
                      className="flex-row items-center border-b border-slate-100 px-2 py-2.5"
                    >
                      <Text className="text-xs text-slate-500" style={{ flex: 1.5 }} numberOfLines={1}>
                        {formattedDate}
                      </Text>
                      <Text className="text-xs font-semibold text-slate-800" style={{ flex: 2.5 }} numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      {isAdmin && (
                        <Text className="text-[12px] text-slate-500" style={{ flex: 1.5 }} numberOfLines={1}>
                          {transaction.category?.name ?? 'Uncategorized'}
                        </Text>
                      )}
                      <Text
                        className="text-right text-xs font-bold"
                        style={{ flex: 2, color: amountColor }}
                      >
                        {formatCurrency(Number(transaction.amount), {
                          showPlusSign: transaction.type === 'income',
                          isNegative: transaction.type !== 'income',
                        })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
