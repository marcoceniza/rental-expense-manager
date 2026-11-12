import React, { useState, useMemo } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { LayoutGrid, Pencil, Trash2, ChevronLeft, ChevronRight, User } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, Badge, EmptyState } from '../components/DisplayComponents';
import EditTransactionModal from '../components/EditTransactionModal';
import { formatCurrency } from '../utils/formatters';
import type { Transaction } from '../types';

export default function OthersScreen() {
  const { transactions, deleteTransaction, currentUser } = useApp();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let y = 2024; y <= currentYear + 3; y++) yearList.push(y);
    return yearList;
  }, []);

  const othersList = useMemo(() => {
    return transactions.filter((t) => t.isOther && t.date.endsWith(String(selectedYear)));
  }, [transactions, selectedYear]);

  const total = useMemo(() => othersList.reduce((sum, t) => sum + t.amount, 0), [othersList]);
  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (error: unknown) {
      Alert.alert('Unable to delete transaction', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const confirmDelete = (id: string, description: string) => {
    Alert.alert('Delete transaction?', `${description} will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void handleDelete(id) },
    ]);
  };

  return (
    <>
    <ScrollView className="flex-1 bg-slate-50">
      <View className="gap-3.5 px-4 pb-9 pt-4">
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <LayoutGrid size={20} color="#1e293b" />
              <Text className="text-xl font-extrabold text-slate-900">Others</Text>
            </View>
            <Text className="text-xs text-slate-500">Monitor all transactions related to others.</Text>
          </View>

          {/* Year navigation */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => selectedYear > 2024 && setSelectedYear(selectedYear - 1)}>
              <ChevronLeft size={20} color={selectedYear > 2024 ? '#475569' : '#cbd5e1'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowYearPicker(!showYearPicker)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5"
            >
              <Text className="text-[14px] font-bold text-slate-700">{selectedYear}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedYear(selectedYear + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
            >
              <ChevronRight size={20} color={selectedYear < new Date().getFullYear() ? '#475569' : '#cbd5e1'} />
            </TouchableOpacity>
          </View>
        </View>

        <Card className="gap-1 border-l-4 border-l-emerald-500 p-4">
          <Text className="text-[13px] font-extrabold tracking-[0.8px] text-slate-400">
            OTHER TRANSACTIONS TOTAL
          </Text>
          <Text className="mt-0.5 text-[25px] font-black text-green-600">
            {formatCurrency(total, { showPlusSign: true })}
          </Text>
          <Text className="text-[14px] text-slate-500">Year {selectedYear}</Text>
        </Card>

        <View className="gap-2.5">
          <Text className="text-[16px] font-bold text-slate-700">
            Transactions ({othersList.length})
          </Text>

          {othersList.length === 0 ? (
            <EmptyState message="No other transactions found for this year." />
          ) : othersList.map((item) => (
            <Card key={item.id} className="gap-2 p-3.5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>{item.description}</Text>
                  <View className="mt-1 flex-row items-center gap-1.5">
                    <User size={12} color="#94a3b8" />
                    <Text className="text-[12px] text-slate-500">{item.addedBy}</Text>
                  </View>
                </View>
                <Text className="text-sm font-extrabold text-green-600">
                  {formatCurrency(item.amount, { showPlusSign: true })}
                </Text>
              </View>

              <View className="flex-row items-center justify-between border-t border-slate-50 pt-1.5">
                <Badge label={item.category} type="INCOME" />
                <View className="flex-row items-center gap-2">
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
          ))}
        </View>
      </View>
    </ScrollView>
    {editingTransaction && (
      <EditTransactionModal
        key={editingTransaction.id}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    )}
    </>
  );
}
