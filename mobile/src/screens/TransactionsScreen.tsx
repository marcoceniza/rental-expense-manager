import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Search,
  X,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RNCard, RNBadge } from '../components/NativeComponents';
import { formatCurrency } from '../utils/formatters';
import { TransactionType } from '../types';

export default function TransactionsScreen() {
  const { transactions, deleteTransaction, addTransaction, categories } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New tx form state
  const [desc, setDesc] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState(categories[0]?.name || 'Maintenance (Repairs, Utilities)');
  const [date, setDate] = useState('Sep 28, 2026');

  const months = ['All', 'Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026'];

  const filtered = transactions.filter((tx) => {
    if (selectedType !== 'All' && tx.type !== selectedType.toUpperCase()) return false;
    if (selectedMonth !== 'All' && !tx.date.includes(selectedMonth.split(' ')[0])) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.subDescription?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const incomeTotal = filtered
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotal = filtered
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const liabilityTotal = filtered
    .filter((t) => t.type === 'LIABILITY')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCreate = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !desc.trim()) return;

    addTransaction({
      description: desc.trim(),
      subDescription: subDesc.trim() || undefined,
      category,
      amount: num,
      type: txType,
      date,
    });

    setDesc('');
    setSubDesc('');
    setAmount('');
    setIsModalOpen(false);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <FileSpreadsheet size={20} color="#1e293b" />
              <Text style={styles.titleText}>Transactions</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsModalOpen(true)}
              style={styles.addBtn}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#ffffff" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitleText}>Manage all your financial records in one place.</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search transactions..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Type Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsRow}
        >
          {['All', 'Income', 'Expense', 'Liability'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedType(t)}
              style={[styles.chip, selectedType === t && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Month Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {months.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setSelectedMonth(m)}
              style={[styles.chipMonth, selectedMonth === m && styles.chipMonthActive]}
            >
              <Text style={[styles.chipMonthText, selectedMonth === m && styles.chipMonthTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filtered Totals Card */}
        <RNCard style={styles.totalsCard}>
          <Text style={styles.totalsHeader}>FILTERED TOTALS</Text>
          <View style={styles.totalsGrid}>
            <View>
              <Text style={styles.totalLabel}>Income</Text>
              <Text style={[styles.totalVal, { color: '#16a34a' }]}>{formatCurrency(incomeTotal)}</Text>
            </View>
            <View>
              <Text style={styles.totalLabel}>Expense</Text>
              <Text style={[styles.totalVal, { color: '#dc2626' }]}>{formatCurrency(expenseTotal)}</Text>
            </View>
            <View>
              <Text style={styles.totalLabel}>Liability</Text>
              <Text style={[styles.totalVal, { color: '#d97706' }]}>{formatCurrency(liabilityTotal)}</Text>
            </View>
          </View>
        </RNCard>

        {/* Transaction Cards List */}
        <View style={styles.listContainer}>
          <Text style={styles.recordsCount}>
            Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </Text>

          {filtered.map((item) => {
            const isInc = item.type === 'INCOME';
            const isLiab = item.type === 'LIABILITY';

            return (
              <RNCard key={item.id} style={styles.txCard}>
                <View style={styles.txTopRow}>
                  <View style={styles.txDescGroup}>
                    <Text style={styles.txDescText}>{item.description}</Text>
                    {item.subDescription && (
                      <Text style={styles.txSubDescText}>{item.subDescription}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.txAmountText,
                      { color: isInc ? '#16a34a' : isLiab ? '#d97706' : '#dc2626' },
                    ]}
                  >
                    {formatCurrency(item.amount, { showPlusSign: isInc, isNegative: !isInc })}
                  </Text>
                </View>

                <View style={styles.txBottomRow}>
                  <RNBadge label={item.category} type={item.type} />
                  <View style={styles.txMetaGroup}>
                    <Text style={styles.txDateText}>{item.date}</Text>
                    <TouchableOpacity
                      onPress={() => deleteTransaction(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </RNCard>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Type toggle */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeSelectorRow}>
                  {(['EXPENSE', 'INCOME', 'LIABILITY'] as TransactionType[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTxType(t)}
                      style={[
                        styles.typeSelectBtn,
                        txType === t && styles.typeSelectBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeSelectBtnText,
                          txType === t && styles.typeSelectBtnTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  placeholder="e.g. 1st Floor Rent or Solar Battery"
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Sub Description (Optional)</Text>
                <TextInput
                  value={subDesc}
                  onChangeText={setSubDesc}
                  placeholder="e.g. Downpayment"
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount (₱)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setCategory(c.name)}
                      style={[
                        styles.catOption,
                        category === c.name && styles.catOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.catOptionText,
                          category === c.name && styles.catOptionTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="e.g. Sep 28, 2026"
                  style={styles.input}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithIcon: {
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a56db',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  chipsScroll: {
    marginTop: 2,
  },
  chipsRow: {
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  chipActive: {
    backgroundColor: '#1a56db',
    borderColor: '#1a56db',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipMonth: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipMonthActive: {
    backgroundColor: '#e0e7ff',
    borderColor: '#6366f1',
  },
  chipMonthText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  chipMonthTextActive: {
    color: '#4338ca',
    fontWeight: '700',
  },
  totalsCard: {
    padding: 14,
    backgroundColor: '#ffffff',
    gap: 10,
  },
  totalsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  totalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  totalVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  listContainer: {
    gap: 10,
  },
  recordsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  txCard: {
    padding: 14,
    gap: 8,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txDescGroup: {
    flex: 1,
    marginRight: 12,
  },
  txDescText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  txSubDescText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  txAmountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  txBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  txMetaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txDateText: {
    fontSize: 11,
    color: '#64748b',
  },
  deleteBtn: {
    padding: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalForm: {
    maxHeight: 380,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  typeSelectBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1a56db',
  },
  typeSelectBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  typeSelectBtnTextActive: {
    color: '#1a56db',
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  catScroll: {
    flexDirection: 'row',
  },
  catOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: '#f8fafc',
  },
  catOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  catOptionText: {
    fontSize: 11,
    color: '#475569',
  },
  catOptionTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1a56db',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
