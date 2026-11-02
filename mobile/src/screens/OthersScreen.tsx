import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LayoutGrid, Trash2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RNCard, RNBadge } from '../components/NativeComponents';
import { formatCurrency } from '../utils/formatters';

export default function OthersScreen() {
  const { transactions, deleteTransaction } = useApp();

  const othersList = transactions.filter(
    (t) =>
      t.isOther ||
      t.category.includes('CR under stairs') ||
      t.description.toLowerCase().includes('water income') ||
      t.description.toLowerCase().includes('cr under stairs')
  );

  const total = othersList.reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LayoutGrid size={20} color="#1e293b" />
          <Text style={styles.titleText}>Others</Text>
        </View>
        <Text style={styles.subtitleText}>Monitor all transactions related to others.</Text>
      </View>

      <RNCard style={styles.totalCard}>
        <Text style={styles.totalLabel}>OTHER TRANSACTIONS TOTAL</Text>
        <Text style={styles.totalVal}>{formatCurrency(total, { showPlusSign: true })}</Text>
        <Text style={styles.totalSub}>Year 2026</Text>
      </RNCard>

      <View style={styles.listSection}>
        <Text style={styles.listHeader}>Transactions ({othersList.length})</Text>

        {othersList.map((item) => (
          <RNCard key={item.id} style={styles.itemCard}>
            <View style={styles.itemTop}>
              <Text style={styles.descText}>{item.description}</Text>
              <Text style={styles.amountText}>
                {formatCurrency(item.amount, { showPlusSign: true })}
              </Text>
            </View>

            <View style={styles.itemBottom}>
              <RNBadge label={item.category} type="INCOME" />
              <View style={styles.metaRow}>
                <Text style={styles.dateText}>{item.date}</Text>
                <TouchableOpacity
                  onPress={() => deleteTransaction(item.id)}
                  style={styles.trashBtn}
                >
                  <Trash2 size={14} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          </RNCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    gap: 14,
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
  totalCard: {
    padding: 16,
    gap: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  totalVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16a34a',
    marginTop: 2,
  },
  totalSub: {
    fontSize: 11,
    color: '#64748b',
  },
  listSection: {
    gap: 10,
  },
  listHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  itemCard: {
    padding: 14,
    gap: 8,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
  },
  trashBtn: {
    padding: 4,
  },
});
