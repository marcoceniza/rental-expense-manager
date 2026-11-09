import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { type DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { CalendarDays, X } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import type { Transaction, TransactionType } from '../types';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

function toDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function EditTransactionModal({ transaction, onClose }: EditTransactionModalProps) {
  const { categories, updateTransaction } = useApp();
  const [description, setDescription] = useState(transaction.description);
  const [remarks, setRemarks] = useState(transaction.subDescription ?? '');
  const [amount, setAmount] = useState(String(transaction.amount));
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [date, setDate] = useState(toDate(transaction.transactionDate));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSave = async () => {
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 || !categoryId) {
      Alert.alert('Invalid transaction', 'Enter a description, a positive amount, and choose a category.');
      return;
    }

    try {
      await updateTransaction(transaction.id, {
        description: description.trim(),
        remarks: remarks.trim(),
        category_id: Number(categoryId),
        amount: numericAmount,
        type: type.toLowerCase() as 'income' | 'expense' | 'liability',
        transaction_date: [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-'),
      });
      onClose();
    } catch (error: unknown) {
      Alert.alert(
        'Unable to update transaction',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const handleDateChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    setDate(selectedDate);
    if (Platform.OS === 'android') setIsDatePickerOpen(false);
  };

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="max-h-[85%] rounded-t-3xl bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-extrabold text-slate-900">Edit Transaction</Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" activeOpacity={1}>
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView
              className="max-h-[430px]"
              style={{ flexShrink: 1 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
              nestedScrollEnabled
            >
              <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Type</Text>
              <View className="mb-3.5 flex-row gap-2">
                {(['EXPENSE', 'INCOME', 'LIABILITY'] as const).map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      if (value === type) return;
                      setType(value);
                      const nextCategory = categories.find((item) => item.type === value);
                      setCategoryId(nextCategory?.id ?? '');
                    }}
                    className={`flex-1 items-center rounded-lg border py-2 ${type === value ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}
                    activeOpacity={1}
                  >
                    <Text className={`text-[13px] font-semibold ${type === value ? 'text-blue-700' : 'text-slate-600'}`}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                autoCapitalize="none"
                className="mb-3.5 rounded-lg border border-slate-300 px-3 py-3 text-[16px] text-slate-900"
              />
              <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Sub-description</Text>
              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                autoCapitalize="none"
                placeholder="Optional"
                className="mb-3.5 rounded-lg border border-slate-300 px-3 py-3 text-[16px] text-slate-900"
              />
              <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Amount</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                autoCapitalize="none"
                keyboardType="decimal-pad"
                className="mb-3.5 rounded-lg border border-slate-300 px-3 py-3 text-[16px] text-slate-900"
              />
              <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3.5">
                <View className="flex-row gap-2">
                  {categories.filter((item) => item.type === type).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setCategoryId(item.id)}
                      className={`rounded-lg border px-3 py-2 ${categoryId === item.id ? 'border-blue-700 bg-blue-50' : 'border-slate-200 bg-white'}`}
                      activeOpacity={1}
                    >
                      <Text className={`text-[14px] ${categoryId === item.id ? 'font-bold text-blue-700' : 'text-slate-600'}`}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Date</Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setIsDatePickerOpen(true)}
                className="mb-2 flex-row items-center justify-between rounded-lg border border-slate-300 px-3 py-3"
                activeOpacity={1}
              >
                <Text className="text-[16px] text-slate-900">
                  {date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </Text>
                <CalendarDays size={18} color="#64748b" />
              </TouchableOpacity>
              {isDatePickerOpen && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onValueChange={handleDateChange}
                  onDismiss={() => setIsDatePickerOpen(false)}
                />
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => void handleSave()}
              className="mt-4 items-center rounded-lg bg-blue-700 py-3"
              activeOpacity={1}
            >
              <Text className="text-[16px] font-bold text-white">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
