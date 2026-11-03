import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { PieChart } from 'lucide-react-native';
import { Card } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';
import {
  MONTHLY_BREAKDOWN_2026,
  CATEGORY_REPORT_2026,
} from '../data/initialData';

export default function ReportsScreen() {
  const [selectedYear] = useState('2026');

  const annualIncome = 784999.0;
  const annualExpenses = 579354.35;
  const annualLiabilities = 829322.0;
  const netProfitLoss = -623677.35;

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
            <Text className="text-[10px] font-bold tracking-[0.8px] text-slate-400">ANNUAL INCOME</Text>
            <Text className="mt-1 text-lg font-extrabold text-green-600">{formatCurrency(annualIncome)}</Text>
          </Card>
          <Card className="min-w-[150px] flex-1 p-3.5">
            <Text className="text-[10px] font-bold tracking-[0.8px] text-slate-400">ANNUAL EXPENSES</Text>
            <Text className="mt-1 text-lg font-extrabold text-red-600">{formatCurrency(annualExpenses)}</Text>
          </Card>
          <Card className="min-w-[150px] flex-1 p-3.5">
            <Text className="text-[10px] font-bold tracking-[0.8px] text-slate-400">ANNUAL LIABILITIES</Text>
            <Text className="mt-1 text-lg font-extrabold text-amber-600">{formatCurrency(annualLiabilities)}</Text>
          </Card>
          <Card className="min-w-[150px] flex-1 p-3.5">
            <Text className="text-[10px] font-bold tracking-[0.8px] text-slate-400">NET PROFIT/LOSS</Text>
            <Text className="mt-1 text-lg font-extrabold text-red-600">{formatCurrency(netProfitLoss)}</Text>
          </Card>
        </View>

        <Card className="gap-3 p-4">
          <Text className="text-[15px] font-bold text-slate-900">
            Monthly Breakdown ({selectedYear})
          </Text>
          <View className="gap-2.5">
            {MONTHLY_BREAKDOWN_2026.map((row) => (
              <View
                key={row.month}
                className="flex-row items-center justify-between border-b border-slate-100 py-2"
              >
                <View className="gap-1">
                  <Text className="text-[13px] font-bold text-slate-900">{row.month}</Text>
                  <Text className={`text-[11px] font-bold ${row.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net {formatCurrency(row.net)}
                  </Text>
                </View>
                <View className="items-end gap-0.5">
                  <Text className="text-[11px] font-semibold text-green-600">+ {formatCurrency(row.income)}</Text>
                  <Text className="text-[11px] font-semibold text-red-600">- {formatCurrency(row.expense)}</Text>
                  {row.liability > 0 && (
                    <Text className="text-[11px] font-semibold text-amber-600">
                      L {formatCurrency(row.liability)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card className="gap-3 p-4">
          <Text className="text-[15px] font-bold text-slate-900">Category Report</Text>
          <View className="gap-2">
            {CATEGORY_REPORT_2026.map((category, index) => {
              const color =
                category.type === 'INCOME'
                  ? '#2563eb'
                  : category.type === 'LIABILITY'
                    ? '#d97706'
                    : '#dc2626';
              return (
                <View
                  key={index}
                  className="flex-row items-center justify-between border-b border-slate-50 py-1.5"
                >
                  <View className="mr-2.5 flex-1">
                    <Text className="text-xs font-semibold text-slate-900" numberOfLines={1}>
                      {category.name}
                    </Text>
                    <Text
                      className="mt-0.5 text-[9px] font-bold tracking-[0.5px]"
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
