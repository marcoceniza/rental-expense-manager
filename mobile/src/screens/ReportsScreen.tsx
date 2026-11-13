import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, FileDown, FileSpreadsheet, PieChart, BarChart3 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, EmptyState } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';
import { getAnnualReport, getCategorySummary } from '../services/api';

export default function ReportsScreen() {
  const { currentUser } = useApp();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [report, setReport] = useState<{ monthly: { month: string; income: number; expense: number; liability: number; net: number }[]; totals: { income: number; expense: number; liability: number; net: number } } | null>(null);
  const [categorySummary, setCategorySummary] = useState<{ name: string; type: string; total: number }[]>([]);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  const years = [2024, 2025, 2026, 2027];

  const normalizeReport = (data: { monthly: { month: string; income: number | string; expense: number | string; liability: number | string; net: number | string }[]; totals: { income: number | string; expense: number | string; liability: number | string; net: number | string } }) => ({
    monthly: data.monthly.map((m) => ({
      month: m.month,
      income: Number(m.income),
      expense: Number(m.expense),
      liability: Number(m.liability),
      net: Number(m.net),
    })),
    totals: {
      income: Number(data.totals.income),
      expense: Number(data.totals.expense),
      liability: Number(data.totals.liability),
      net: Number(data.totals.net),
    },
  });

  useEffect(() => {
    let active = true;

    Promise.all([
      getAnnualReport(selectedYear),
      getCategorySummary(selectedYear),
    ])
      .then(([annualReportData, catSummaryData]) => {
        if (!active) return;
        setReport(normalizeReport(annualReportData));
        setCategorySummary(catSummaryData.categoryReport || []);
      })
      .catch((error: unknown) => {
        if (!active) return;
        Alert.alert(
          'Unable to load financial report',
          error instanceof Error ? error.message : 'Please try again.',
        );
      });

    return () => {
      active = false;
    };
  }, [selectedYear]);

  const maxAmount = useMemo(() => {
    const monthly = report?.monthly || [];
    let max = 0;
    monthly.forEach((row) => {
      if (row.income > max) max = row.income;
      if (row.expense > max) max = row.expense;
      if (row.liability > max) max = row.liability;
    });
    return max || 1;
  }, [report]);

  const annualIncome = Number(report?.totals.income ?? 0);
  const annualExpenses = Number(report?.totals.expense ?? 0);
  const annualLiabilities = Number(report?.totals.liability ?? 0);
  const netProfitLoss = Number(report?.totals.net ?? 0);

  const handleExport = () => {
    Alert.alert(
      'Export Report',
      'PDF export is not available yet.',
      [{ text: 'OK' }],
    );
  };

  const isBarVisible = !!(report?.monthly && report.monthly.length > 0);

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="gap-4 px-4 pb-9 pt-4">
        {/* Header: title on left, year selector + export stacked on right */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <View className="flex-row items-center gap-2">
                <FileSpreadsheet size={20} color="#1e293b" />
                <Text className="text-xl font-extrabold text-slate-900">Financial Reports</Text>
              </View>
              <Text className="text-xs text-slate-500">Analyze your annual performance.</Text>
            </View>

            <View className="gap-2">
              {/* Year selector dropdown */}
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setIsYearPickerOpen(!isYearPickerOpen)}
                  className="flex-row justify-between items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <Text className="text-[14px] font-bold text-slate-700">{selectedYear}</Text>
                  {isYearPickerOpen ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                </TouchableOpacity>

                {isYearPickerOpen && (
                  <View className="absolute right-0 top-full mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                    {years.map((y) => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => { setSelectedYear(y); setIsYearPickerOpen(false); }}
                        className={`px-3 py-2 ${y === selectedYear ? 'bg-blue-50' : ''}`}
                      >
                        <Text className={`text-[14px] font-semibold ${y === selectedYear ? 'text-blue-700' : 'text-slate-700'}`}>{y}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Export PDF button (admin only) */}
              {currentUser?.role === 'Admin' && (
                <TouchableOpacity
                  onPress={handleExport}
                  className="flex-row items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2"
                >
                  <FileDown size={14} color="#ffffff" />
                  <Text className="text-[14px] font-bold text-white">Export PDF</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Annual Stats Cards */}
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
            <Text className={`mt-1 text-lg font-extrabold ${netProfitLoss >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(netProfitLoss)}
            </Text>
          </Card>
        </View>

        {/* Monthly Breakdown Table */}
        <Card className="gap-3 p-4">
          <View className="flex-row items-center gap-2">
            <BarChart3 size={18} color="#2563eb" />
            <Text className="text-[18px] font-bold text-slate-900">Monthly Breakdown</Text>
          </View>

          {!isBarVisible ? (
            <EmptyState message="No data available for this year." />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View className="gap-0" style={{ minWidth: 520 }}>
                              {/* Header row */}
                              <View className="flex-row items-center border-b border-slate-200 py-2">
                                  <Text className="flex-1 px-2 text-[12px] font-bold uppercase text-slate-400" numberOfLines={1}>Month</Text>
                                  <Text className="w-28 px-2 text-right text-[12px] font-bold uppercase text-emerald-600" numberOfLines={1}>Income</Text>
                                  <Text className="w-28 px-2 text-right text-[12px] font-bold uppercase text-red-600" numberOfLines={1}>Expense</Text>
                                  <Text className="w-28 px-2 text-right text-[12px] font-bold uppercase text-amber-600" numberOfLines={1}>Liability</Text>
                                  <Text className="w-32 px-2 text-right text-[12px] font-bold uppercase text-slate-400" numberOfLines={1}>Net</Text>
                              </View>

                              {report?.monthly.map((row) => (
                                  <View key={row.month} className="flex-row items-center border-b border-slate-50 py-2">
                                      <Text className="flex-1 px-2 text-[14px] font-bold text-slate-700" numberOfLines={1}>{row.month}</Text>
                                      <Text className="w-28 px-2 text-right text-[13px] font-semibold text-emerald-600" numberOfLines={1}>
                                          {formatCurrency(Number(row.income))}
                                      </Text>
                                      <Text className="w-28 px-2 text-right text-[13px] font-semibold text-red-600" numberOfLines={1}>
                                          {formatCurrency(Number(row.expense))}
                                      </Text>
                                      <Text className="w-28 px-2 text-right text-[13px] font-semibold text-amber-600" numberOfLines={1}>
                                          {formatCurrency(Number(row.liability))}
                                      </Text>
                                      <Text className={`w-32 px-2 text-right text-[13px] font-bold ${Number(row.net) >= 0 ? 'text-slate-900' : 'text-red-600'}`} numberOfLines={1}>
                                          {formatCurrency(Number(row.net))}
                                      </Text>
                                  </View>
                              ))}

                              {/* Totals row */}
                              <View className="flex-row items-center border-t-2 border-slate-200 bg-slate-50 py-2">
                                  <Text className="flex-1 px-2 text-[13px] font-bold uppercase text-slate-600" numberOfLines={1}>TOTALS</Text>
                                  <Text className="w-28 px-2 text-right text-[13px] font-bold text-emerald-600" numberOfLines={1}>
                                      {formatCurrency(report.totals.income)}
                                  </Text>
                                  <Text className="w-28 px-2 text-right text-[13px] font-bold text-red-600" numberOfLines={1}>
                                      {formatCurrency(report.totals.expense)}
                                  </Text>
                                  <Text className="w-28 px-2 text-right text-[13px] font-bold text-amber-600" numberOfLines={1}>
                                      {formatCurrency(report.totals.liability)}
                                  </Text>
                                  <Text className={`w-32 px-2 text-right text-[13px] font-bold ${report.totals.net >= 0 ? 'text-slate-900' : 'text-red-600'}`} numberOfLines={1}>
                                      {formatCurrency(report.totals.net)}
                                  </Text>
                              </View>
                          </View>
            </ScrollView>
          )}
        </Card>

        {/* Annual Summary Bar Chart */}
        {currentUser?.role === 'Admin' && isBarVisible && (
          <Card className="gap-3 p-4">
            <View className="flex-row items-center gap-2">
              <BarChart3 size={18} color="#2563eb" />
              <Text className="text-[18px] font-bold text-slate-900">Annual Summary</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row items-end gap-2 pb-2">
                {report?.monthly.map((m) => {
                  const incomeH = maxAmount > 0 ? (Number(m.income) / maxAmount) * 150 : 0;
                  const expenseH = maxAmount > 0 ? (Number(m.expense) / maxAmount) * 150 : 0;
                  const liabilityH = maxAmount > 0 ? (Number(m.liability) / maxAmount) * 150 : 0;

                  return (
                    <View key={m.month} className="items-center" style={{ width: 32 }}>
                      {/* Income bar */}
                      <View
                        style={{
                          width: 8,
                          height: Math.max(incomeH, 2),
                          backgroundColor: '#10b981',
                          borderRadius: 2,
                        }}
                      />
                      {/* Expense bar */}
                      <View
                        style={{
                          width: 8,
                          height: Math.max(expenseH, 2),
                          backgroundColor: '#ef4444',
                          borderRadius: 2,
                          marginTop: 1,
                        }}
                      />
                      {/* Liability bar */}
                      <View
                        style={{
                          width: 8,
                          height: Math.max(liabilityH, 2),
                          backgroundColor: '#f59e0b',
                          borderRadius: 2,
                          marginTop: 1,
                        }}
                      />
                      <Text className="mt-1 text-[9px] text-slate-400" numberOfLines={1}>
                        {m.month.substring(0, 3)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Chart Legend */}
            <View className="flex-row justify-center gap-4 border-t border-slate-100 pt-3">
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <Text className="text-[13px] text-slate-600">Income</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                <Text className="text-[13px] text-slate-600">Expense</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                <Text className="text-[13px] text-slate-600">Liability</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Category Report (from server API) */}
        {currentUser?.role === 'Admin' && (
          <Card className="gap-3 p-4">
            <View className="flex-row items-center gap-2">
              <PieChart size={18} color="#2563eb" />
              <Text className="text-[18px] font-bold text-slate-900">Category Report</Text>
            </View>

            {categorySummary.length === 0 ? (
              <EmptyState message="No category data available for this year." />
            ) : (
              <View className="gap-2.5">
                {categorySummary.map((category) => {
                  const color =
                    category.type === 'INCOME' || category.type === 'income'
                      ? '#2563eb'
                      : category.type === 'LIABILITY' || category.type === 'liability'
                        ? '#d97706'
                        : '#dc2626';
                  const normalizedType = category.type.charAt(0).toUpperCase() + category.type.slice(1).toLowerCase();

                  return (
                    <View
                      key={category.name}
                      className="flex-row items-center justify-between border-b border-slate-50 py-1.5"
                    >
                      <View className="mr-2.5 flex-1">
                        <Text className="text-[14px] font-bold text-slate-900" numberOfLines={1}>
                          {category.name}
                        </Text>
                        <Text
                          className="mt-0.5 text-[12px] font-bold tracking-[0.5px]"
                          style={{ color }}
                        >
                          {normalizedType}
                        </Text>
                      </View>
                      <Text className="text-[14px] font-bold text-slate-900">
                        {formatCurrency(Number(category.total))}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
