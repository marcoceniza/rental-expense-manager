import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View, Text, ScrollView } from 'react-native';
import { PieChart } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, EmptyState } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';
import { getAnnualReport } from '../services/api';

export default function ReportsScreen() {
  const { transactions } = useApp();
  const selectedYear = new Date().getFullYear();
  const [report, setReport] = useState<Awaited<ReturnType<typeof getAnnualReport>> | null>(null);

  useEffect(() => {
    let active = true;
    getAnnualReport(selectedYear)
      .then((result) => {
        if (active) setReport(result);
      })
      .catch((error: unknown) => {
        Alert.alert(
          'Unable to load financial report',
          error instanceof Error ? error.message : 'Please try again.',
        );
      });

    return () => {
      active = false;
    };
  }, [selectedYear]);

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, { type: string; amount: number }>();
    transactions
      .filter((transaction) => transaction.date.endsWith(String(selectedYear)))
      .forEach((transaction) => {
        const key = `${transaction.category}:${transaction.type}`;
        const current = totals.get(key) ?? { type: transaction.type, amount: 0 };
        current.amount += transaction.amount;
        totals.set(key, current);
      });
    return Array.from(totals, ([key, value]) => ({
      name: key.slice(0, key.lastIndexOf(':')),
      ...value,
    })).sort((a, b) => b.amount - a.amount);
  }, [selectedYear, transactions]);

  const annualIncome = Number(report?.totals.income ?? 0);
  const annualExpenses = Number(report?.totals.expense ?? 0);
  const annualLiabilities = Number(report?.totals.liability ?? 0);
  const netProfitLoss = Number(report?.totals.net ?? 0);

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="gap-4 px-4 pb-9 pt-4">
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <PieChart size={20} color="#1e293b" />
            <Text className="text-xl font-extrabold text-slate-900">Financial Reports</Text>
          </View>
          <Text className="text-xs text-slate-500">Analyze your annual performance.</Text>
        </View>

        <View className="flex-row flex-wrap gap-2.5">
          <Card className="min-w-[150px] flex-1 p-3.5">
            <Text className="text-[13px] font-bold tracking-[0.8px] text-slate-400">ANNUAL INCOME</Text>
            <Text className="mt-1 text-lg font-extrabold text-green-600">{formatCurrency(annualIncome)}</Text>
          </Card>
          <Card className="min-w-[150px] flex-1 p-3.5">
            <Text className="text-[13px] font-bold tracking-[0.8px] text-slate-400">ANNUAL EXPENSES</Text>
            <Text className="mt-1 text-lg font-extrabold text-red-600">{formatCurrency(annualExpenses)}</Text>
          </Card>
          <Card className="min-w-[150px] flex-1 p-3.5">
            <Text className="text-[13px] font-bold tracking-[0.8px] text-slate-400">ANNUAL LIABILITIES</Text>
            <Text className="mt-1 text-lg font-extrabold text-amber-600">{formatCurrency(annualLiabilities)}</Text>
          </Card>
          <Card className="min-w-[150px] flex-1 p-3.5">
            <Text className="text-[13px] font-bold tracking-[0.8px] text-slate-400">NET PROFIT/LOSS</Text>
            <Text className="mt-1 text-lg font-extrabold text-red-600">{formatCurrency(netProfitLoss)}</Text>
          </Card>
        </View>

        <Card className="gap-3 p-4">
          <Text className="text-[18px] font-bold text-slate-900">
            Monthly Breakdown ({selectedYear})
          </Text>
          <View className="gap-2.5">
            {!report ? (
              <EmptyState message="No annual report data is available." />
            ) : report.monthly.length === 0 ? (
              <EmptyState message="No monthly report data is available for this year." />
            ) : report.monthly.map((row) => (
              <View
                key={row.month}
                className="flex-row items-center justify-between border-b border-slate-100 py-2"
              >
                <View className="gap-1">
                  <Text className="text-[16px] font-bold text-slate-900">{row.month}</Text>
                  <Text className={`text-[14px] font-bold ${Number(row.net) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net {formatCurrency(Number(row.net))}
                  </Text>
                </View>
                <View className="items-end gap-0.5">
                  <Text className="text-[14px] font-semibold text-green-600">+ {formatCurrency(Number(row.income))}</Text>
                  <Text className="text-[14px] font-semibold text-red-600">- {formatCurrency(Number(row.expense))}</Text>
                  {Number(row.liability) > 0 && (
                    <Text className="text-[14px] font-semibold text-amber-600">
                      L {formatCurrency(Number(row.liability))}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card className="gap-3 p-4">
          <Text className="text-[18px] font-bold text-slate-900">Category Report</Text>
          <View className="gap-2">
            {categoryTotals.length === 0 ? (
              <EmptyState message="No category transactions are available for this year." />
            ) : categoryTotals.map((category) => {
              const color =
                category.type === 'INCOME'
                  ? '#2563eb'
                  : category.type === 'LIABILITY'
                    ? '#d97706'
                    : '#dc2626';
              return (
                <View
                  key={`${category.name}-${category.type}`}
                  className="flex-row items-center justify-between border-b border-slate-50 py-1.5"
                >
                  <View className="mr-2.5 flex-1">
                    <Text className="text-xs font-semibold text-slate-900" numberOfLines={1}>
                      {category.name}
                    </Text>
                    <Text
                      className="mt-0.5 text-[12px] font-bold tracking-[0.5px]"
                      style={{ color }}
                    >
                      {category.type}
                    </Text>
                  </View>
                  <Text className="text-xs font-bold text-slate-900">
                    {formatCurrency(category.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
