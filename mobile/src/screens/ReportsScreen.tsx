import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { PieChart } from 'lucide-react-native';
import { RNCard } from '../components/NativeComponents';
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
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <PieChart size={20} color="#1e293b" />
          <Text style={styles.titleText}>Financial Reports</Text>
        </View>
        <Text style={styles.subtitleText}>Analyze your annual performance.</Text>
      </View>

      {/* Annual Summary Metrics Grid */}
      <View style={styles.metricsGrid}>
        <RNCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>ANNUAL INCOME</Text>
          <Text style={[styles.metricVal, { color: '#16a34a' }]}>
            {formatCurrency(annualIncome)}
          </Text>
        </RNCard>

        <RNCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>ANNUAL EXPENSES</Text>
          <Text style={[styles.metricVal, { color: '#dc2626' }]}>
            {formatCurrency(annualExpenses)}
          </Text>
        </RNCard>

        <RNCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>ANNUAL LIABILITIES</Text>
          <Text style={[styles.metricVal, { color: '#d97706' }]}>
            {formatCurrency(annualLiabilities)}
          </Text>
        </RNCard>

        <RNCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>NET PROFIT/LOSS</Text>
          <Text style={[styles.metricVal, { color: '#dc2626' }]}>
            {formatCurrency(netProfitLoss)}
          </Text>
        </RNCard>
      </View>

      {/* Monthly Breakdown Card */}
      <RNCard style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>Monthly Breakdown ({selectedYear})</Text>

        <View style={styles.breakdownList}>
          {MONTHLY_BREAKDOWN_2026.map((row) => (
            <View key={row.month} style={styles.monthRow}>
              <View style={styles.monthCol}>
                <Text style={styles.monthName}>{row.month}</Text>
                <Text style={[styles.netBadge, row.net >= 0 ? styles.netPos : styles.netNeg]}>
                  Net {formatCurrency(row.net)}
                </Text>
              </View>

              <View style={styles.amountsCol}>
                <Text style={styles.incomeText}>+ {formatCurrency(row.income)}</Text>
                <Text style={styles.expenseText}>- {formatCurrency(row.expense)}</Text>
                {row.liability > 0 && (
                  <Text style={styles.liabText}>L {formatCurrency(row.liability)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </RNCard>

      {/* Category Breakdown */}
      <RNCard style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>Category Report</Text>
        <View style={styles.categoryList}>
          {CATEGORY_REPORT_2026.map((cat, idx) => (
            <View key={idx} style={styles.catRow}>
              <View style={styles.catInfo}>
                <Text style={styles.catName} numberOfLines={1}>
                  {cat.name}
                </Text>
                <Text
                  style={[
                    styles.catType,
                    {
                      color:
                        cat.type === 'INCOME'
                          ? '#2563eb'
                          : cat.type === 'LIABILITY'
                          ? '#d97706'
                          : '#dc2626',
                    },
                  ]}
                >
                  {cat.type}
                </Text>
              </View>
              <Text style={styles.catAmount}>{formatCurrency(cat.amount)}</Text>
            </View>
          ))}
        </View>
      </RNCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 36,
  },
  header: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748b',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    padding: 14,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  breakdownCard: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  breakdownList: {
    gap: 10,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  monthCol: {
    gap: 4,
  },
  monthName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  netBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  netPos: {
    color: '#16a34a',
  },
  netNeg: {
    color: '#dc2626',
  },
  amountsCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  incomeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  expenseText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  liabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d97706',
  },
  categoryList: {
    gap: 8,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  catInfo: {
    flex: 1,
    marginRight: 10,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  catType: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  catAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
});
