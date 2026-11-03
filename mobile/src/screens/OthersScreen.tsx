import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LayoutGrid, Trash2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, Badge } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';

export default function OthersScreen() {
  const { transactions, deleteTransaction } = useApp();

  const othersList = transactions.filter(
    (transaction) =>
      transaction.isOther ||
      transaction.category.includes('CR under stairs') ||
      transaction.description.toLowerCase().includes('water income') ||
      transaction.description.toLowerCase().includes('cr under stairs'),
  );
  const total = othersList.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="gap-3.5 px-4 pb-9 pt-4">
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <LayoutGrid size={20} color="#1e293b" />
            <Text className="text-xl font-extrabold text-slate-900">Others</Text>
          </View>
          <Text className="text-xs text-slate-500">Monitor all transactions related to others.</Text>
        </View>

        <Card className="gap-1 border-l-4 border-l-emerald-500 p-4">
          <Text className="text-[10px] font-extrabold tracking-[0.8px] text-slate-400">
            OTHER TRANSACTIONS TOTAL
          </Text>
          <Text className="mt-0.5 text-[22px] font-black text-green-600">
            {formatCurrency(total, { showPlusSign: true })}
          </Text>
          <Text className="text-[11px] text-slate-500">Year 2026</Text>
        </Card>

        <View className="gap-2.5">
          <Text className="text-[13px] font-bold text-slate-700">
            Transactions ({othersList.length})
          </Text>

          {othersList.map((item) => (
            <Card key={item.id} className="gap-2 p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-slate-900">{item.description}</Text>
                <Text className="text-sm font-extrabold text-green-600">
                  {formatCurrency(item.amount, { showPlusSign: true })}
                </Text>
              </View>

              <View className="flex-row items-center justify-between border-t border-slate-50 pt-1.5">
                <Badge label={item.category} type="INCOME" />
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
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
