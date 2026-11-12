import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker, { type DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import {
  AlertCircle,
  CalendarDays,
  FileSpreadsheet,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Search,
  X,
  User,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, Badge, EmptyState } from '../components/DisplayComponents';
import EditTransactionModal from '../components/EditTransactionModal';
import { formatCurrency } from '../utils/formatters';
import { Transaction, TransactionType } from '../types';

export default function TransactionsScreen() {
  const {
    transactions,
    transactionsLastPage,
    loadMoreTransactions,
    resetTransactions,
    trashedTransactions,
    loadTrashedTransactions,
    restoreTransaction,
    permanentlyDeleteTransaction,
    deleteTransaction,
    addTransaction,
    categories,
    currentUser,
  } = useApp();

  React.useEffect(() => {
    void resetTransactions();
  }, [resetTransactions]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isTrashLoading, setIsTrashLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [desc, setDesc] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const year = new Date().getFullYear();
  const months = [
    'All',
    ...Array.from({ length: 12 }, (_, index) =>
      new Date(year, 11 - index, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
    ),
  ];

  const { filtered, incomeTotal, expenseTotal, liabilityTotal } = useMemo(() => {
    const filtered: Transaction[] = [];
    let incomeTotal = 0;
    let expenseTotal = 0;
    let liabilityTotal = 0;

    for (const transaction of transactions) {
      if (transaction.isCharity || transaction.isOther) continue;
      if (selectedType !== 'All' && transaction.type !== selectedType.toUpperCase()) continue;
      if (selectedMonth !== 'All' && !transaction.date.includes(selectedMonth.split(' ')[0])) continue;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          transaction.description.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query) ||
          transaction.subDescription?.toLowerCase().includes(query);
        if (!matches) continue;
      }

      filtered.push(transaction);

      if (transaction.type === 'INCOME') {
        incomeTotal += transaction.amount;
      } else if (transaction.type === 'EXPENSE') {
        expenseTotal += transaction.amount;
      } else if (transaction.type === 'LIABILITY') {
        liabilityTotal += transaction.amount;
      }
    }

    return { filtered, incomeTotal, expenseTotal, liabilityTotal };
  }, [transactions, selectedType, selectedMonth, searchTerm]);

  const handleCreate = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !desc.trim()) {
      Alert.alert('Invalid transaction', 'Enter a description and an amount greater than zero.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Category required', 'Choose a category before saving the transaction.');
      return;
    }

    try {
      await addTransaction({
        description: desc.trim(),
        remarks: subDesc.trim() || undefined,
        category_id: Number(categoryId),
        amount: numericAmount,
        type: txType.toLowerCase() as 'income' | 'expense' | 'liability',
        transaction_date: [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-'),
      });

      setDesc('');
      setSubDesc('');
      setAmount('');
      setIsModalOpen(false);
    } catch (error: unknown) {
      Alert.alert(
        'Unable to save transaction',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const handleDateChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    setDate(selectedDate);
    if (Platform.OS === 'android') setIsDatePickerOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (error: unknown) {
      Alert.alert(
        'Unable to delete transaction',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const confirmDelete = (id: string, description: string) => {
    Alert.alert('Delete transaction?', `${description} will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void handleDelete(id) },
    ]);
  };

  const openTrash = async () => {
    setIsTrashLoading(true);
    try {
      await loadTrashedTransactions();
      setIsTrashOpen(true);
    } catch (error: unknown) {
      Alert.alert(
        'Unable to load Trash Bin',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsTrashLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreTransaction(id);
    } catch (error: unknown) {
      Alert.alert(
        'Unable to restore transaction',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const handlePermanentlyDelete = (id: string, description: string) => {
    Alert.alert(
      'Permanently delete transaction?',
      `${description} cannot be recovered after deletion.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: () => {
            void permanentlyDeleteTransaction(id).catch((error: unknown) => {
              Alert.alert(
                'Unable to permanently delete transaction',
                error instanceof Error ? error.message : 'Please try again.',
              );
            });
          },
        },
      ],
    );
  };

  const inputClassName = 'rounded-lg border border-slate-300 px-3 py-2 text-[16px] text-slate-900';

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 bg-slate-50"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <View className="gap-3.5 px-4 pb-9 pt-4">
          <View className="gap-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <FileSpreadsheet size={20} color="#1e293b" />
                <Text className="text-xl font-extrabold text-slate-900">Transactions</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {currentUser?.role === 'Admin' && (
                  <TouchableOpacity
                    onPress={() => void openTrash()}
                    accessibilityRole="button"
                    accessibilityLabel={`Open Trash Bin${trashedTransactions.length ? `, ${trashedTransactions.length} deleted transactions` : ''}`}
                    className="relative h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50"
                    activeOpacity={0.8}
                    disabled={isTrashLoading}
                  >
                    {isTrashLoading
                      ? <Text className="text-[12px] font-bold text-red-700">...</Text>
                      : <Trash2 size={20} color="#dc2626" />}
                    {trashedTransactions.length > 0 && !isTrashLoading && (
                      <View className="absolute -right-1.5 -top-1.5 min-h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1">
                        <Text className="text-[10px] font-extrabold leading-[13px] text-white">
                          {trashedTransactions.length > 99 ? '99+' : trashedTransactions.length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setIsModalOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add transaction"
                  className="h-10 w-10 items-center justify-center rounded-xl bg-blue-700"
                  activeOpacity={0.8}
                >
                  <Plus size={22} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-xs text-slate-500">
              Manage all your financial records in one place.
            </Text>
          </View>

          <View className="flex-row items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2">
            <Search size={16} color="#94a3b8" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
              placeholder="Search transactions..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-[16px] text-slate-900"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-0.5">
            <View className="flex-row gap-2">
              {['All', 'Income', 'Expense', 'Liability'].map((type) => {
                const isSelected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedType(type)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    className="rounded-full border px-3.5 py-1.5"
                    activeOpacity={1}
                    style={{
                      backgroundColor: isSelected ? '#1d4ed8' : '#ffffff',
                      borderColor: isSelected ? '#1d4ed8' : '#cbd5e1',
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: isSelected ? '#ffffff' : '#475569' }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {months.map((month) => {
                const isSelected = selectedMonth === month;
                return (
                  <TouchableOpacity
                    key={month}
                    onPress={() => setSelectedMonth(month)}
                    className={`rounded-md border px-2.5 py-1 ${isSelected ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200 bg-white'}`}
                    activeOpacity={1}
                  >
                    <Text className={`text-[14px] font-medium ${isSelected ? 'font-bold text-indigo-800' : 'text-slate-600'}`}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Card className="gap-2.5 p-3.5">
            <Text className="text-[13px] font-extrabold tracking-[0.8px] text-slate-400">
              FILTERED TOTALS
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-[14px] font-medium text-slate-500">Income</Text>
                <Text className="mt-0.5 text-sm font-extrabold text-green-600">
                  {formatCurrency(incomeTotal)}
                </Text>
              </View>
              <View>
                <Text className="text-[14px] font-medium text-slate-500">Expense</Text>
                <Text className="mt-0.5 text-sm font-extrabold text-red-600">
                  {formatCurrency(expenseTotal)}
                </Text>
              </View>
              <View>
                <Text className="text-[14px] font-medium text-slate-500">Liability</Text>
                <Text className="mt-0.5 text-sm font-extrabold text-amber-600">
                  {formatCurrency(liabilityTotal)}
                </Text>
              </View>
            </View>
          </Card>

          <View className="gap-2.5">
            <Text className="text-[14px] font-semibold text-slate-400">
              Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </Text>

            {filtered.length === 0 ? (
              <EmptyState
                message={transactions.length === 0
                  ? 'No transactions yet. Add a transaction to get started.'
                  : 'No transactions match the selected filters or search.'}
              />
            ) : filtered.map((item) => {
              const isIncome = item.type === 'INCOME';
              const isLiability = item.type === 'LIABILITY';
              const amountColor = isIncome ? '#16a34a' : isLiability ? '#d97706' : '#dc2626';
              return (
                <Card key={item.id} className="gap-2 p-3.5">
                  <View className="flex-row items-start justify-between">
                    <View className="mr-3 flex-1">
                      <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>{item.description}</Text>
                      {item.subDescription && (
                        <Text className="mt-px text-[14px] text-slate-400">{item.subDescription}</Text>
                      )}
                      <View className="mt-1 flex-row items-center gap-1.5">
                        <User size={11} color="#94a3b8" />
                        <Text className="text-[11px] text-slate-500">{item.addedBy}</Text>
                      </View>
                    </View>
                    <Text className="text-[18px] font-extrabold" style={{ color: amountColor }}>
                      {formatCurrency(item.amount, { showPlusSign: isIncome, isNegative: !isIncome })}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between border-t border-slate-50 pt-1">
                    <Badge label={item.category} type={item.type} numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: '60%' }} />
                    <View className="flex-row items-center gap-2 flex-shrink-0">
                      <Text className="text-[14px] text-slate-500">{item.date}</Text>
                      <TouchableOpacity
                        onPress={() => setEditingTransaction(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${item.description}`}
                        className="p-1"
                      >
                        <Pencil size={14} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDelete(item.id, item.description)}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${item.description}`}
                        className="p-1"
                      >
                        <Trash2 size={14} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })}

            {transactionsLastPage > 1 && (
              <TouchableOpacity
                onPress={() => loadMoreTransactions()}
                className="mt-3 items-center rounded-lg bg-blue-600 px-4 py-3"
                activeOpacity={0.8}
              >
                <Text className="text-[14px] font-bold text-white">Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View className="flex-1 justify-end bg-black/60">
          <View className="max-h-[85%] rounded-t-3xl bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-extrabold text-slate-900">Add Transaction</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} activeOpacity={1}>
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="max-h-[380px]"
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
              nestedScrollEnabled
            >
              <View className="mb-3.5">
                <Text className="mb-1.5 text-[14px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Type
                </Text>
                <View className="flex-row gap-2">
                  {(['EXPENSE', 'INCOME', 'LIABILITY'] as TransactionType[]).map((type) => {
                    const isSelected = txType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        onPress={() => {
                          setTxType(type);
                          const nextCategory = categories.find((item) => item.type === type);
                          setCategoryId(nextCategory?.id ?? '');
                        }}
                        className={`flex-1 items-center rounded-lg border py-2 ${isSelected ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}
                        activeOpacity={1}
                      >
                        <Text className={`text-[14px] font-semibold ${isSelected ? 'font-extrabold text-blue-700' : 'text-slate-500'}`}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[14px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Description
                </Text>
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  autoCapitalize="none"
                  placeholder="e.g. 1st Floor Rent or Solar Battery"
                  className={inputClassName}
                />
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[14px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Sub Description (Optional)
                </Text>
                <TextInput
                  value={subDesc}
                  onChangeText={setSubDesc}
                  autoCapitalize="none"
                  placeholder="e.g. Downpayment"
                  className={inputClassName}
                />
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[14px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Amount (₱)
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  autoCapitalize="none"
                  placeholder="0.00"
                  keyboardType="numeric"
                  className={inputClassName}
                />
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[14px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {categories.filter((item) => item.type === txType).length === 0 ? (
                      <Text className="py-2 text-[14px] text-slate-500">No categories for this transaction type. Add a category first.</Text>
                    ) : categories.filter((item) => item.type === txType).map((item) => {
                      const isSelected = categoryId === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => setCategoryId(item.id)}
                          className={`mr-1.5 rounded-lg border px-2.5 py-1.5 ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                          activeOpacity={1}
                        >
                          <Text className={`text-[14px] ${isSelected ? 'font-bold text-blue-600' : 'text-slate-600'}`}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[14px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Date
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Choose transaction date, ${date.toLocaleDateString('en-US')}`}
                  onPress={() => setIsDatePickerOpen(true)}
                  className="flex-row items-center justify-between rounded-lg border border-slate-300 px-3 py-3"
                  activeOpacity={1}
                >
                  <Text className="text-[16px] text-slate-900">
                    {date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </Text>
                  <CalendarDays size={18} color="#64748b" />
                </TouchableOpacity>
                {isDatePickerOpen && (
                  <View className="mt-2">
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onValueChange={handleDateChange}
                      onDismiss={() => setIsDatePickerOpen(false)}
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => setIsDatePickerOpen(false)}
                        className="mt-2 self-end rounded-lg bg-blue-700 px-4 py-2"
                        activeOpacity={1}
                      >
                        <Text className="text-[16px] font-semibold text-white">Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>

            <View className="mt-4 flex-row justify-end gap-2.5 border-t border-slate-100 pt-3">
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-2.5"
                activeOpacity={1}
              >
                <Text className="text-[16px] font-semibold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                className="rounded-lg bg-blue-700 px-5 py-2.5"
                activeOpacity={1}
              >
                <Text className="text-[16px] font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
      {editingTransaction && (
        <EditTransactionModal
          key={editingTransaction.id}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
      <Modal
        visible={isTrashOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsTrashOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[85%] rounded-t-3xl bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Trash2 size={20} color="#dc2626" />
                <Text className="text-lg font-extrabold text-slate-900">Trash Bin</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsTrashOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close Trash Bin"
                activeOpacity={1}
              >
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flexShrink: 1 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {trashedTransactions.length === 0 ? (
                <View className="items-center gap-3 py-10">
                  <AlertCircle size={36} color="#cbd5e1" />
                  <Text className="text-center text-[14px] text-slate-400">
                    The Trash Bin is currently empty.
                  </Text>
                </View>
              ) : (
                <View className="gap-2">
                  {trashedTransactions.map((item) => (
                    <Card key={item.id} className="gap-2 p-3.5">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-[13px] text-slate-500">{item.date}</Text>
                          <Text className="mt-0.5 text-[15px] font-bold text-slate-900">
                            {item.description}
                          </Text>
                          <Text className="mt-0.5 text-[13px] text-slate-500">
                            {item.type} · {item.category}
                          </Text>
                        </View>
                        <Text className="text-[15px] font-bold text-slate-700">
                          {formatCurrency(item.amount)}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between border-t border-slate-100 pt-2">
                        <Text className="text-[13px] text-slate-500">
                          Deleted {item.deletedAt
                            ? new Date(item.deletedAt).toLocaleDateString()
                            : 'date unavailable'}
                        </Text>
                        <View className="flex-row items-center gap-3">
                          <TouchableOpacity
                            onPress={() => void handleRestore(item.id)}
                            accessibilityRole="button"
                            accessibilityLabel={`Restore ${item.description}`}
                            className="flex-row items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-2"
                            activeOpacity={1}
                          >
                            <RotateCcw size={15} color="#059669" />
                            <Text className="text-[13px] font-bold text-emerald-700">Restore</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handlePermanentlyDelete(item.id, item.description)}
                            accessibilityRole="button"
                            accessibilityLabel={`Permanently delete ${item.description}`}
                            className="rounded-lg bg-red-50 p-2"
                            activeOpacity={1}
                          >
                            <Trash2 size={16} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setIsTrashOpen(false)}
              className="mt-4 items-center rounded-lg border border-slate-200 bg-white py-3"
              activeOpacity={1}
            >
              <Text className="text-[15px] font-semibold text-slate-700">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
