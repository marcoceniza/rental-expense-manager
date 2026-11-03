import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { FileSpreadsheet, Plus, Trash2, Search, X } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, Badge } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';
import { TransactionType } from '../types';

export default function TransactionsScreen() {
  const { transactions, deleteTransaction, addTransaction, categories } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState(categories[0]?.name || 'Maintenance (Repairs, Utilities)');
  const [date, setDate] = useState('Sep 28, 2026');

  const months = ['All', 'Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026'];

  const filtered = transactions.filter((transaction) => {
    if (selectedType !== 'All' && transaction.type !== selectedType.toUpperCase()) return false;
    if (selectedMonth !== 'All' && !transaction.date.includes(selectedMonth.split(' ')[0])) return false;
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.subDescription?.toLowerCase().includes(query)
      );
    }
    return true;
  });
  const incomeTotal = filtered
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenseTotal = filtered
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const liabilityTotal = filtered
    .filter((transaction) => transaction.type === 'LIABILITY')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleCreate = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !desc.trim()) return;

    addTransaction({
      description: desc.trim(),
      subDescription: subDesc.trim() || undefined,
      category,
      amount: numericAmount,
      type: txType,
      date,
    });

    setDesc('');
    setSubDesc('');
    setAmount('');
    setIsModalOpen(false);
  };

  const inputClassName = 'rounded-lg border border-slate-300 px-3 py-2 text-[13px] text-slate-900';

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
              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                className="flex-row items-center gap-1 rounded-lg bg-blue-700 px-3 py-[7px]"
                activeOpacity={0.8}
              >
                <Plus size={16} color="#ffffff" />
                <Text className="text-xs font-bold text-white">Add</Text>
              </TouchableOpacity>
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
              placeholder="Search transactions..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-[13px] text-slate-900"
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
                    className={`rounded-full border px-3.5 py-1.5 ${isSelected ? 'border-blue-700 bg-blue-700' : 'border-slate-300 bg-white'}`}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
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
                  >
                    <Text className={`text-[11px] font-medium ${isSelected ? 'font-bold text-indigo-800' : 'text-slate-600'}`}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Card className="gap-2.5 p-3.5">
            <Text className="text-[10px] font-extrabold tracking-[0.8px] text-slate-400">
              FILTERED TOTALS
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-[11px] font-medium text-slate-500">Income</Text>
                <Text className="mt-0.5 text-sm font-extrabold text-green-600">
                  {formatCurrency(incomeTotal)}
                </Text>
              </View>
              <View>
                <Text className="text-[11px] font-medium text-slate-500">Expense</Text>
                <Text className="mt-0.5 text-sm font-extrabold text-red-600">
                  {formatCurrency(expenseTotal)}
                </Text>
              </View>
              <View>
                <Text className="text-[11px] font-medium text-slate-500">Liability</Text>
                <Text className="mt-0.5 text-sm font-extrabold text-amber-600">
                  {formatCurrency(liabilityTotal)}
                </Text>
              </View>
            </View>
          </Card>

          <View className="gap-2.5">
            <Text className="text-[11px] font-semibold text-slate-400">
              Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </Text>

            {filtered.map((item) => {
              const isIncome = item.type === 'INCOME';
              const isLiability = item.type === 'LIABILITY';
              const amountColor = isIncome ? '#16a34a' : isLiability ? '#d97706' : '#dc2626';
              return (
                <Card key={item.id} className="gap-2 p-3.5">
                  <View className="flex-row items-start justify-between">
                    <View className="mr-3 flex-1">
                      <Text className="text-sm font-bold text-slate-900">{item.description}</Text>
                      {item.subDescription && (
                        <Text className="mt-px text-[11px] text-slate-400">{item.subDescription}</Text>
                      )}
                    </View>
                    <Text className="text-[15px] font-extrabold" style={{ color: amountColor }}>
                      {formatCurrency(item.amount, { showPlusSign: isIncome, isNegative: !isIncome })}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between border-t border-slate-50 pt-1">
                    <Badge label={item.category} type={item.type} />
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[11px] text-slate-500">{item.date}</Text>
                      <TouchableOpacity
                        onPress={() => deleteTransaction(item.id)}
                        className="p-1"
                      >
                        <Trash2 size={14} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Modal visible={isModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <View className="flex-1 justify-end bg-black/60">
          <View className="max-h-[85%] rounded-t-3xl bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-extrabold text-slate-900">Add Transaction</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="max-h-[380px]"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            >
              <View className="mb-3.5">
                <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Type
                </Text>
                <View className="flex-row gap-2">
                  {(['EXPENSE', 'INCOME', 'LIABILITY'] as TransactionType[]).map((type) => {
                    const isSelected = txType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setTxType(type)}
                        className={`flex-1 items-center rounded-lg border py-2 ${isSelected ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}
                      >
                        <Text className={`text-[11px] font-semibold ${isSelected ? 'font-extrabold text-blue-700' : 'text-slate-500'}`}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Description
                </Text>
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  placeholder="e.g. 1st Floor Rent or Solar Battery"
                  className={inputClassName}
                />
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Sub Description (Optional)
                </Text>
                <TextInput
                  value={subDesc}
                  onChangeText={setSubDesc}
                  placeholder="e.g. Downpayment"
                  className={inputClassName}
                />
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Amount (₱)
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  className={inputClassName}
                />
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {categories.map((item) => {
                      const isSelected = category === item.name;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => setCategory(item.name)}
                          className={`mr-1.5 rounded-lg border px-2.5 py-1.5 ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                        >
                          <Text className={`text-[11px] ${isSelected ? 'font-bold text-blue-600' : 'text-slate-600'}`}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View className="mb-3.5">
                <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-slate-600">
                  Date
                </Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="e.g. Sep 28, 2026"
                  className={inputClassName}
                />
              </View>
            </ScrollView>

            <View className="mt-4 flex-row justify-end gap-2.5 border-t border-slate-100 pt-3">
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-2.5"
              >
                <Text className="text-[13px] font-semibold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                className="rounded-lg bg-blue-700 px-5 py-2.5"
              >
                <Text className="text-[13px] font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
