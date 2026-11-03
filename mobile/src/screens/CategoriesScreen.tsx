import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Tag, Search } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/DisplayComponents';

export default function CategoriesScreen() {
  const { categories } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filtered = categories.filter((cat) => {
    if (selectedType !== 'All' && cat.type !== selectedType.toUpperCase()) return false;
    if (searchTerm.trim() && !cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View className="gap-3.5 px-4 pb-9 pt-4">
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <Tag size={20} color="#1e293b" />
            <Text className="text-xl font-extrabold text-slate-900">Categories</Text>
          </View>
          <Text className="text-xs text-slate-500">Manage income and expense categories.</Text>
        </View>

        <View className="flex-row items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2">
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search categories..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-[13px] text-slate-900"
          />
        </View>

        <View className="flex-row gap-2">
          {['All', 'Expense', 'Income', 'Liability'].map((type) => {
            const isSelected = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                className={`rounded-lg border px-3 py-1.5 ${isSelected ? 'border-blue-700 bg-blue-700' : 'border-slate-200 bg-white'}`}
              >
                <Text className={`text-[11px] font-semibold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="gap-2.5">
          {filtered.map((cat) => {
            const isIncome = cat.type === 'INCOME';
            const isLiability = cat.type === 'LIABILITY';
            const color = isIncome ? '#2563eb' : isLiability ? '#d97706' : '#dc2626';
            const iconBg = isIncome ? '#eff6ff' : isLiability ? '#fffbeb' : '#fef2f2';

            return (
              <Card key={cat.id} className="gap-2 p-4">
                <View
                  className="h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: iconBg }}
                >
                  <Tag size={16} color={color} />
                </View>
                <Text className="text-sm font-bold leading-[18px] text-slate-900">{cat.name}</Text>
                <Text className="text-[10px] font-extrabold tracking-[0.5px]" style={{ color }}>
                  {cat.type}
                </Text>
              </Card>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
