import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Repeat, Trash2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/DisplayComponents';
import { formatCurrency } from '../utils/formatters';

export default function RecurringScreen() {
  const { recurring, deleteRecurring } = useApp();

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="gap-3.5 px-4 pb-9 pt-4">
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <Repeat size={20} color="#1e293b" />
            <Text className="text-xl font-extrabold text-slate-900">Recurring Transactions</Text>
          </View>
          <Text className="text-xs text-slate-500">
            Automate your monthly income and expenses.
          </Text>
        </View>

        <View className="gap-3">
          {recurring.map((item) => (
            <Card key={item.id} className="gap-3 p-4">
              <View className="flex-row items-center justify-between">
                <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-blue-50">
                  <Repeat size={16} color="#2563eb" />
                </View>
                <TouchableOpacity onPress={() => deleteRecurring(item.id)} className="p-1">
                  <Trash2 size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View className="gap-0.5">
                <Text className="text-[15px] font-bold text-slate-900">{item.title}</Text>
                <Text className="text-[10px] font-bold uppercase tracking-[0.8px] text-slate-400" numberOfLines={1}>
                  {item.category}
                </Text>
              </View>

              <View className="flex-row items-end justify-between border-t border-slate-100 pt-2.5">
                <View>
                  <Text className="text-[9px] font-bold tracking-[0.5px] text-slate-400">AMOUNT</Text>
                  <Text className="mt-0.5 text-base font-extrabold text-slate-900">
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
                <View className="rounded-xl bg-blue-50 px-2 py-[3px]">
                  <Text className="text-[10px] font-bold text-blue-600">{item.frequency}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
