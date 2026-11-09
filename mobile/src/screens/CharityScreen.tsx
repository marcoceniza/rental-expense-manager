import React, { useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Heart, Pencil, Trash2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, Badge, EmptyState } from '../components/DisplayComponents';
import EditTransactionModal from '../components/EditTransactionModal';
import { formatCurrency } from '../utils/formatters';
import type { Transaction } from '../types';

export default function CharityScreen() {
  const { transactions, deleteTransaction } = useApp();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const charityList = transactions.filter((transaction) => transaction.isCharity);
  const total = charityList.reduce((sum, transaction) => sum + transaction.amount, 0);
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
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <Heart size={20} color="#f43f5e" fill="#f43f5e" />
            <Text className="text-xl font-extrabold text-slate-900">Charity</Text>
          </View>
          <Text className="text-xs text-slate-500">
            Monitor all transactions related to tuition and educational support.
          </Text>
        </View>

        <Card className="gap-1 border-l-4 border-l-rose-500 p-4">
          <Text className="text-[13px] font-extrabold tracking-[0.8px] text-slate-400">
            TUITION &amp; EDUCATIONAL SUPPORT TOTAL
          </Text>
          <Text className="mt-0.5 text-[25px] font-black text-red-600">
            {formatCurrency(total, { isNegative: true })}
          </Text>
          <Text className="text-[14px] text-slate-500">Year {new Date().getFullYear()}</Text>
        </Card>

        <View className="gap-2.5">
          <Text className="text-[16px] font-bold text-slate-700">
            Tuition Related Transactions ({charityList.length})
          </Text>

          {charityList.length === 0 ? (
            <EmptyState message="No tuition or charity transactions found for this year." />
          ) : charityList.map((item) => (
            <Card key={item.id} className="gap-2 p-3.5">
              <View className="flex-row items-start justify-between">
                <View className="mr-2.5 flex-1">
                  <Text className="text-sm font-bold text-slate-900">{item.description}</Text>
                  {item.subDescription && (
                    <Text className="mt-px text-[14px] text-slate-400">{item.subDescription}</Text>
                  )}
                </View>
                <Text className="text-sm font-extrabold text-red-600">
                  {formatCurrency(item.amount, { isNegative: true })}
                </Text>
              </View>

              <View className="flex-row items-center justify-between border-t border-slate-50 pt-1.5">
                <Badge label={item.category} type="DEFAULT" />
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
