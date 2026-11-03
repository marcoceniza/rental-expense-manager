import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Heart, Trash2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, Badge } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';

export default function CharityScreen() {
  const { transactions, deleteTransaction } = useApp();

  const charityList = transactions.filter(
    (transaction) =>
      transaction.isCharity ||
      transaction.category === 'Tuition' ||
      transaction.category === 'Donation',
  );
  const total = charityList.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
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
          <Text className="text-[10px] font-extrabold tracking-[0.8px] text-slate-400">
            TUITION &amp; EDUCATIONAL SUPPORT TOTAL
          </Text>
          <Text className="mt-0.5 text-[22px] font-black text-red-600">
            {formatCurrency(total, { isNegative: true })}
          </Text>
          <Text className="text-[11px] text-slate-500">Year 2026</Text>
        </Card>

        <View className="gap-2.5">
          <Text className="text-[13px] font-bold text-slate-700">
            Tuition Related Transactions ({charityList.length})
          </Text>

          {charityList.map((item) => (
            <Card key={item.id} className="gap-2 p-3.5">
              <View className="flex-row items-start justify-between">
                <View className="mr-2.5 flex-1">
                  <Text className="text-sm font-bold text-slate-900">{item.description}</Text>
                  {item.subDescription && (
                    <Text className="mt-px text-[11px] text-slate-400">{item.subDescription}</Text>
                  )}
                </View>
                <Text className="text-sm font-extrabold text-red-600">
                  {formatCurrency(item.amount, { isNegative: true })}
                </Text>
              </View>

              <View className="flex-row items-center justify-between border-t border-slate-50 pt-1.5">
                <Badge label={item.category} type="DEFAULT" />
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
