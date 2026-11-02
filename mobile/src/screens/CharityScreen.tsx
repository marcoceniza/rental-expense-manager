import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Heart, Trash2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RNCard, RNBadge } from '../components/NativeComponents';
import { formatCurrency } from '../utils/formatters';

export default function CharityScreen() {
  const { transactions, deleteTransaction } = useApp();

  const charityList = transactions.filter(
    (t) => t.isCharity || t.category === 'Tuition' || t.category === 'Donation'
  );

  const total = charityList.reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Heart size={20} color="#f43f5e" fill="#f43f5e" />
          <Text style={styles.titleText}>Charity</Text>
        </View>
        <Text style={styles.subtitleText}>
          Monitor all transactions related to tuition and educational support.
        </Text>
      </View>

      {/* Total Card */}
      <RNCard style={styles.totalCard}>
        <Text style={styles.totalLabel}>TUITION & EDUCATIONAL SUPPORT TOTAL</Text>
        <Text style={styles.totalVal}>{formatCurrency(total, { isNegative: true })}</Text>
        <Text style={styles.totalSub}>Year 2026</Text>
      </RNCard>

      {/* List */}
      <View style={styles.listSection}>
        <Text style={styles.listHeader}>
          Tuition Related Transactions ({charityList.length})
        </Text>

        {charityList.map((item) => (
          <RNCard key={item.id} style={styles.itemCard}>
            <View style={styles.itemTop}>
              <View style={styles.descWrap}>
                <Text style={styles.descText}>{item.description}</Text>
                {item.subDescription && (
                  <Text style={styles.subDescText}>{item.subDescription}</Text>
                )}
              </View>
              <Text style={styles.amountText}>
                {formatCurrency(item.amount, { isNegative: true })}
              </Text>
            </View>

            <View style={styles.itemBottom}>
              <RNBadge label={item.category} type="DEFAULT" />
              <View style={styles.metaWrap}>
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
    backgroundColor: '#ffffff',
    gap: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#f43f5e',
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
    color: '#dc2626',
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
    alignItems: 'flex-start',
  },
  descWrap: {
    flex: 1,
    marginRight: 10,
  },
  descText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  subDescText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#dc2626',
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  metaWrap: {
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
