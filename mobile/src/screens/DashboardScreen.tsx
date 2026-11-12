import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  User,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { StatCard, Card } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';

export default function DashboardScreen() {
  const { transactions, setActiveTab, currentUser } = useApp();

  const isAdmin = currentUser?.role === 'Admin';

  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, index) =>
    `${new Date(year, index, 1).toLocaleString('en-US', { month: 'long' })} ${year}`,
  );
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const currentMonth = months[currentMonthIndex];
  const shortMonth = currentMonth.split(' ')[0].substring(0, 3);
  const monthTransactions = transactions.filter((transaction) =>
    transaction.date.includes(shortMonth),
  );
  const totalIncome = monthTransactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = monthTransactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalLiabilities = monthTransactions
    .filter((transaction) => transaction.type === 'LIABILITY')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const netBalance = totalIncome - totalExpenses - totalLiabilities;

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

          <View className="mt-2.5 flex-row flex-wrap items-center gap-2.5">
            <TouchableOpacity
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5"
              onPress={() => setCurrentMonthIndex(new Date().getMonth())}
            >
              <Text className="text-xs font-semibold text-slate-700">This Month</Text>
            </TouchableOpacity>

            <View className="flex-row items-center rounded-lg border border-slate-200 bg-white">
              <TouchableOpacity
                onPress={() => setCurrentMonthIndex((index) => (index > 0 ? index - 1 : months.length - 1))}
                className="p-1.5"
              >
                <ChevronLeft size={16} color="#475569" />
              </TouchableOpacity>
              <Text className="px-2 text-xs font-semibold text-slate-700">{currentMonth}</Text>
              <TouchableOpacity
                onPress={() => setCurrentMonthIndex((index) => (index < months.length - 1 ? index + 1 : 0))}
                className="p-1.5"
              >
                <ChevronRight size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <StatCard
            title="TOTAL INCOME"
            amount={formatCurrency(totalIncome)}
            icon={<TrendingUp size={20} color="#2563eb" />}
            iconBg="#eff6ff"
          />
          <StatCard
            title="TOTAL EXPENSES"
            amount={formatCurrency(totalExpenses)}
            icon={<TrendingDown size={20} color="#f43f5e" />}
            iconBg="#fef2f2"
          />
          <StatCard
            title="LIABILITIES"
            amount={formatCurrency(totalLiabilities)}
            icon={<CreditCard size={20} color="#f59e0b" />}
            iconBg="#fffbeb"
          />
          <StatCard
            title="NET BALANCE"
            amount={formatCurrency(netBalance)}
            icon={<Wallet size={20} color="#059669" />}
            iconBg="#ecfdf5"
          />
        </View>

        <View className="gap-4">
          <Card className="min-h-[260px] justify-between">
            <Text className="text-[18px] font-bold text-slate-900">Monthly Overview</Text>
            <View className="items-center justify-center py-6">
              <View className="h-[140px] w-[140px] items-center justify-center rounded-full border-[10px] border-emerald-500 bg-white">
                <Text className="text-center text-[16px] font-extrabold text-slate-900">
                  {formatCurrency(totalIncome + totalExpenses + totalLiabilities)}
                </Text>
                <Text className="text-[13px] text-slate-400">Total Volume</Text>
              </View>
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

            {monthTransactions.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-center text-xs italic text-slate-400">No transactions recorded yet.</Text>
              </View>
            ) : (
              <View className="gap-1.5">
                {monthTransactions.slice(0, 5).map((transaction) => {
                  const amountColor =
                    transaction.type === 'INCOME'
                      ? '#16a34a'
                      : transaction.type === 'LIABILITY'
                        ? '#d97706'
                        : '#dc2626';
                  return (
                    <View
                      key={transaction.id}
                      className="flex-row items-center border-b border-slate-100 px-2 py-2.5"
                    >
                      <Text className="text-xs text-slate-500" style={{ flex: 1.5 }} numberOfLines={1}>
                        {transaction.date}
                      </Text>
                      <Text className="text-xs font-semibold text-slate-800" style={{ flex: 2.5 }} numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      {isAdmin && (
                        <Text className="text-[12px] text-slate-500" style={{ flex: 1.5 }} numberOfLines={1}>
                          {transaction.category}
                        </Text>
                      )}
                      <Text
                        className="text-right text-xs font-bold"
                        style={{ flex: 2, color: amountColor }}
                      >
                        {formatCurrency(transaction.amount, {
                          showPlusSign: transaction.type === 'INCOME',
                          isNegative: transaction.type !== 'INCOME',
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
