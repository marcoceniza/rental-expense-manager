import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Repeat, Trash2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RNCard } from '../components/NativeComponents';
import { formatCurrency } from '../utils/formatters';

export default function RecurringScreen() {
  const { recurring, deleteRecurring } = useApp();

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Repeat size={20} color="#1e293b" />
          <Text style={styles.titleText}>Recurring Transactions</Text>
        </View>
        <Text style={styles.subtitleText}>Automate your monthly income and expenses.</Text>
      </View>

      {/* Grid of Recurring Cards */}
      <View style={styles.cardsList}>
        {recurring.map((item) => (
          <RNCard key={item.id} style={styles.recurringCard}>
            <View style={styles.cardTop}>
              <View style={styles.iconCircle}>
                <Repeat size={16} color="#2563eb" />
              </View>
              <TouchableOpacity
                onPress={() => deleteRecurring(item.id)}
                style={styles.deleteBtn}
              >
                <Trash2 size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardMid}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCat} numberOfLines={1}>
                {item.category}
              </Text>
            </View>

            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.fieldLabel}>AMOUNT</Text>
                <Text style={styles.fieldVal}>{formatCurrency(item.amount)}</Text>
              </View>
              <View style={styles.badgeWrap}>
                <Text style={styles.freqText}>{item.frequency}</Text>
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
  cardsList: {
    gap: 12,
  },
  recurringCard: {
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: 4,
  },
  cardMid: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardCat: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  fieldVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  badgeWrap: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  freqText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563eb',
  },
});
