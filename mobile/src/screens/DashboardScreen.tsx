import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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
import { RNStatCard, RNCard } from '../components/NativeComponents';
import { formatCurrency } from '../utils/formatters';

export default function DashboardScreen() {
  const { transactions, setActiveTab } = useApp();

  const months = [
    'January 2026',
    'February 2026',
    'March 2026',
    'April 2026',
    'May 2026',
    'June 2026',
    'July 2026',
    'August 2026',
    'September 2026',
    'October 2026',
    'November 2026',
    'December 2026',
  ];

  const [currentMonthIndex, setCurrentMonthIndex] = useState(10); // November 2026
  const currentMonth = months[currentMonthIndex];
  const shortMonth = currentMonth.split(' ')[0].substring(0, 3);

  const monthTransactions = transactions.filter((t) => t.date.includes(shortMonth));

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLiabilities = monthTransactions
    .filter((t) => t.type === 'LIABILITY')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses - totalLiabilities;

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LayoutGrid size={20} color="#1e293b" />
          <Text style={styles.screenTitle}>Financial Overview</Text>
        </View>
        <Text style={styles.screenSubtitle}>Track your income and expenses efficiently.</Text>

        {/* Date Selector bar */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.thisMonthBtn}
            onPress={() => setCurrentMonthIndex(10)}
          >
            <Text style={styles.thisMonthText}>This Month</Text>
          </TouchableOpacity>

          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() => setCurrentMonthIndex((p) => (p > 0 ? p - 1 : months.length - 1))}
              style={styles.chevronBtn}
            >
              <ChevronLeft size={16} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{currentMonth}</Text>
            <TouchableOpacity
              onPress={() => setCurrentMonthIndex((p) => (p < months.length - 1 ? p + 1 : 0))}
              style={styles.chevronBtn}
            >
              <ChevronRight size={16} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4 Stat Cards */}
      <View style={styles.statsGrid}>
        <RNStatCard
          title="TOTAL INCOME"
          amount={formatCurrency(totalIncome)}
          icon={<TrendingUp size={20} color="#2563eb" />}
          iconBg="#eff6ff"
        />
        <RNStatCard
          title="TOTAL EXPENSES"
          amount={formatCurrency(totalExpenses)}
          icon={<TrendingDown size={20} color="#f43f5e" />}
          iconBg="#fef2f2"
        />
        <RNStatCard
          title="LIABILITIES"
          amount={formatCurrency(totalLiabilities)}
          icon={<CreditCard size={20} color="#f59e0b" />}
          iconBg="#fffbeb"
        />
        <RNStatCard
          title="NET BALANCE"
          amount={formatCurrency(netBalance)}
          icon={<Wallet size={20} color="#059669" />}
          iconBg="#ecfdf5"
        />
      </View>

      {/* Quick Jump Buttons */}
      <View style={styles.jumpRow}>
        <Text style={styles.jumpLabel}>View populated data:</Text>
        <TouchableOpacity
          onPress={() => setCurrentMonthIndex(8)}
          style={[styles.jumpBtn, currentMonthIndex === 8 && styles.jumpBtnActive]}
        >
          <Text style={[styles.jumpBtnText, currentMonthIndex === 8 && styles.jumpBtnTextActive]}>
            Sep 2026 (Active)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentMonthIndex(10)}
          style={[styles.jumpBtn, currentMonthIndex === 10 && styles.jumpBtnActive]}
        >
          <Text style={[styles.jumpBtnText, currentMonthIndex === 10 && styles.jumpBtnTextActive]}>
            Nov 2026 (Screenshot)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lower Cards */}
      <View style={styles.cardsGrid}>
        {/* Monthly Overview */}
        <RNCard style={styles.overviewCard}>
          <Text style={styles.cardHeaderTitle}>Monthly Overview</Text>
          <View style={styles.chartArea}>
            <View style={styles.donutPlaceholder}>
              <Text style={styles.donutAmount}>{formatCurrency(totalIncome + totalExpenses + totalLiabilities)}</Text>
              <Text style={styles.donutSub}>Total Volume</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Expense</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Liability</Text>
            </View>
          </View>
        </RNCard>

        {/* Recent Activity */}
        <RNCard style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.cardHeaderTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => setActiveTab('transactions')}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={14} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {/* Table Headers */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thCell, { flex: 2 }]}>DATE</Text>
            <Text style={[styles.thCell, { flex: 3 }]}>DESCRIPTION</Text>
            <Text style={[styles.thCell, { flex: 2, textAlign: 'right' }]}>AMOUNT</Text>
          </View>

          {/* Items or Empty */}
          {monthTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions recorded yet.</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {monthTransactions.slice(0, 5).map((tx) => (
                <View key={tx.id} style={styles.txRow}>
                  <Text style={[styles.tdCell, { flex: 2, color: '#64748b' }]}>{tx.date}</Text>
                  <Text style={[styles.tdCell, { flex: 3, fontWeight: '600' }]} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text
                    style={[
                      styles.tdCell,
                      {
                        flex: 2,
                        textAlign: 'right',
                        fontWeight: '700',
                        color:
                          tx.type === 'INCOME'
                            ? '#16a34a'
                            : tx.type === 'LIABILITY'
                            ? '#d97706'
                            : '#dc2626',
                      },
                    ]}
                  >
                    {formatCurrency(tx.amount, {
                      showPlusSign: tx.type === 'INCOME',
                      isNegative: tx.type !== 'INCOME',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </RNCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  thisMonthBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  thisMonthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  chevronBtn: {
    padding: 6,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    paddingHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  jumpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  jumpLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  jumpBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  jumpBtnActive: {
    backgroundColor: '#1a56db',
    borderColor: '#1a56db',
  },
  jumpBtnText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  jumpBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  cardsGrid: {
    gap: 16,
  },
  overviewCard: {
    minHeight: 260,
    justifyContent: 'space-between',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  chartArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  donutPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  donutAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  donutSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#475569',
  },
  activityCard: {
    minHeight: 260,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a56db',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  thCell: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  listContainer: {
    gap: 6,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tdCell: {
    fontSize: 12,
    color: '#1e293b',
  },
});
