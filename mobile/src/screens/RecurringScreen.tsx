import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import DateTimePicker, { type DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { CalendarDays, Pencil, Plus, Repeat, Trash2, X } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, EmptyState } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';

export default function RecurringScreen() {
  const { recurring, deleteRecurring, addRecurring, updateRecurring, categories } = useApp();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingRecurringId, setEditingRecurringId] = React.useState<string | null>(null);
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [startDate, setStartDate] = React.useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  const openCreate = () => {
    setEditingRecurringId(null);
    setDescription('');
    setAmount('');
    setCategoryId('');
    setStartDate(new Date());
    setIsCreateOpen(true);
  };

  const openEdit = (item: (typeof recurring)[number]) => {
    const [year, month, day] = item.startDate.split('-').map(Number);
    setEditingRecurringId(item.id);
    setDescription(item.title);
    setAmount(String(item.amount));
    setCategoryId(item.categoryId);
    setStartDate(new Date(year, month - 1, day));
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 || !categoryId) {
      Alert.alert('Missing details', 'Enter a description, a positive amount, and choose a category.');
      return;
    }

    try {
      const input = {
        description: description.trim(),
        category_id: Number(categoryId),
        amount: numericAmount,
        frequency: 'monthly',
        start_date: [
          startDate.getFullYear(),
          String(startDate.getMonth() + 1).padStart(2, '0'),
          String(startDate.getDate()).padStart(2, '0'),
        ].join('-'),
      } as const;
      if (editingRecurringId) {
        await updateRecurring(editingRecurringId, input);
      } else {
        await addRecurring(input);
      }
      setIsCreateOpen(false);
    } catch (error: unknown) {
      Alert.alert(
        'Unable to create recurring transaction',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const handleDateChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    setStartDate(selectedDate);
    if (Platform.OS === 'android') setIsDatePickerOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecurring(id);
    } catch (error: unknown) {
      Alert.alert('Unable to delete recurring transaction', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const confirmDelete = (id: string, description: string) => {
    Alert.alert('Delete recurring transaction?', `${description} will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void handleDelete(id) },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="gap-3.5 px-4 pb-9 pt-4">
        <View className="gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Repeat size={20} color="#1e293b" />
              <Text className="text-xl font-extrabold text-slate-900">Recurring Transactions</Text>
            </View>
            <TouchableOpacity
              onPress={openCreate}
              accessibilityRole="button"
              accessibilityLabel="Add recurring transaction"
              className="h-10 w-10 items-center justify-center rounded-xl bg-blue-700"
              activeOpacity={0.8}
            >
              <Plus size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-slate-500">
            Automate your monthly income and expenses.
          </Text>
        </View>

        <View className="gap-3">
          {recurring.length === 0 ? (
            <EmptyState message="No recurring transactions yet. Add one to get started." />
          ) : recurring.map((item) => (
            <Card key={item.id} className="gap-3 p-4">
              <View className="flex-row items-center justify-between">
                <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-blue-50">
                  <Repeat size={16} color="#2563eb" />
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => openEdit(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${item.title}`}
                    className="p-1"
                  >
                    <Pencil size={16} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(item.id, item.title)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.title}`}
                    className="p-1"
                  >
                    <Trash2 size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="gap-0.5">
                <Text className="text-[18px] font-bold text-slate-900">{item.title}</Text>
                <Text className="text-[13px] font-bold uppercase tracking-[0.8px] text-slate-400" numberOfLines={1}>
                  {item.category}
                </Text>
              </View>

              <View className="flex-row items-end justify-between border-t border-slate-100 pt-2.5">
                <View>
                  <Text className="text-[12px] font-bold tracking-[0.5px] text-slate-400">AMOUNT</Text>
                  <Text className="mt-0.5 text-base font-extrabold text-slate-900">
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
                <View className="rounded-xl bg-blue-50 px-2 py-[3px]">
                  <Text className="text-[13px] font-bold text-blue-600">{item.frequency}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <Modal visible={isCreateOpen} transparent animationType="slide" onRequestClose={() => setIsCreateOpen(false)}>
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[85%] rounded-t-3xl bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-extrabold text-slate-900">
                {editingRecurringId ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
              </Text>
              <TouchableOpacity onPress={() => setIsCreateOpen(false)} accessibilityLabel="Close" activeOpacity={1}>
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flexShrink: 1 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
              nestedScrollEnabled
            >
            <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              autoCapitalize="none"
              placeholder="e.g. Monthly rent"
              placeholderTextColor="#94a3b8"
              className="mb-4 rounded-lg border border-slate-300 px-3 py-3 text-[16px] text-slate-900"
            />

            <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              autoCapitalize="none"
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="mb-4 rounded-lg border border-slate-300 px-3 py-3 text-[16px] text-slate-900"
            />

            <Text className="mb-2 text-[14px] font-bold text-slate-600">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {categories.length === 0 ? (
                  <Text className="py-2 text-[14px] text-slate-500">No categories available. Create a category first.</Text>
                ) : categories.map((category) => {
                  const selected = category.id === categoryId;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setCategoryId(category.id)}
                      className={`rounded-lg border px-3 py-2 ${selected ? 'border-blue-700 bg-blue-50' : 'border-slate-200 bg-white'}`}
                      activeOpacity={1}
                    >
                      <Text className={`text-[14px] ${selected ? 'font-bold text-blue-700' : 'text-slate-600'}`}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Start date</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setIsDatePickerOpen(true)}
              className="mb-2 flex-row items-center justify-between rounded-lg border border-slate-300 px-3 py-3"
              activeOpacity={1}
            >
              <Text className="text-[16px] text-slate-900">
                {startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </Text>
              <CalendarDays size={18} color="#64748b" />
            </TouchableOpacity>
            {isDatePickerOpen && (
              <View className="mb-4">
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onValueChange={handleDateChange}
                  onDismiss={() => setIsDatePickerOpen(false)}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity onPress={() => setIsDatePickerOpen(false)} className="mt-2 self-end rounded-lg bg-blue-700 px-4 py-2" activeOpacity={1}>
                    <Text className="text-[16px] font-semibold text-white">Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            </ScrollView>

            <TouchableOpacity onPress={() => void handleSave()} className="mt-4 items-center rounded-lg bg-blue-700 py-3" activeOpacity={1}>
              <Text className="text-[16px] font-bold text-white">
                {editingRecurringId ? 'Save Changes' : 'Save Recurring Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
