import React, { useState } from 'react';
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
  Switch,
} from 'react-native';
import { Pencil, Plus, Tag, Search, Trash2, X, FileText } from 'lucide-react-native';
import { isAxiosError } from 'axios';
import { useApp } from '../context/AppContext';
import { Card, EmptyState } from '../components/DisplayComponents';

export default function CategoriesScreen() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'LIABILITY'>('EXPENSE');
  const [isTuition, setIsTuition] = useState(false);
  const [isOther, setIsOther] = useState(false);

  const filtered = categories.filter((cat) => {
    if (selectedType !== 'All' && cat.type !== selectedType.toUpperCase()) return false;
    if (searchTerm.trim() && !cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditingCategoryId(null);
    setName('');
    setType('EXPENSE');
    setIsTuition(false);
    setIsOther(false);
    setIsCreateOpen(true);
  };

  const openEdit = (category: (typeof categories)[number]) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setType(category.type);
    setIsTuition(category.isCharity ?? false);
    setIsOther(category.isOther ?? false);
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Category name required', 'Enter a name for this category.');
      return;
    }

    try {
      const input = {
        name: name.trim(),
        type: type.toLowerCase() as 'income' | 'expense' | 'liability',
        is_tuition: isTuition,
        is_other: isOther,
      };
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, input);
      } else {
        await addCategory(input);
      }
      setIsCreateOpen(false);
    } catch (error: unknown) {
      Alert.alert(
        editingCategoryId ? 'Unable to update category' : 'Unable to create category',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      Alert.alert(
        'Unable to delete category',
        message ?? (error instanceof Error ? error.message : 'Please try again.'),
      );
    }
  };

  const confirmDelete = (id: string, categoryName: string, transactionsCount: number) => {
    const inUse = transactionsCount > 0;
    const msg = inUse
      ? `${categoryName} has ${transactionsCount} transaction(s) and cannot be deleted.`
      : `${categoryName} will be deleted.`;
    const showDelete = !inUse;
    Alert.alert(
      inUse ? 'Category in use' : 'Delete category?',
      msg,
      [
        { text: 'Cancel', style: 'cancel' as const },
        ...(showDelete
          ? [{ text: 'Delete', style: 'destructive' as const, onPress: () => void handleDelete(id) }]
          : []),
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View className="gap-3.5 px-4 pb-9 pt-4">
        <View className="gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Tag size={20} color="#1e293b" />
              <Text className="text-xl font-extrabold text-slate-900">Categories</Text>
            </View>
            <TouchableOpacity
              onPress={openCreate}
              accessibilityRole="button"
              accessibilityLabel="Add category"
              className="h-10 w-10 items-center justify-center rounded-xl bg-blue-700"
              activeOpacity={0.8}
            >
              <Plus size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-slate-500">Manage income and expense categories.</Text>
        </View>

        <View className="flex-row items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2">
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            placeholder="Search categories..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-[16px] text-slate-900"
          />
        </View>

        <View className="flex-row gap-2">
          {['All', 'Expense', 'Income', 'Liability'].map((type) => {
            const isSelected = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className="rounded-lg border px-3 py-1.5"
                activeOpacity={1}
                style={{
                  backgroundColor: isSelected ? '#1d4ed8' : '#ffffff',
                  borderColor: isSelected ? '#1d4ed8' : '#e2e8f0',
                }}
              >
                <Text
                  className="text-[14px] font-semibold"
                  style={{ color: isSelected ? '#ffffff' : '#475569' }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="gap-2.5">
          {filtered.length === 0 ? (
            <EmptyState
              message={categories.length === 0
                ? 'No categories yet. Add a category to get started.'
                : 'No categories match the selected filter or search.'}
            />
          ) : filtered.map((cat) => {
            const isIncome = cat.type === 'INCOME';
            const isLiability = cat.type === 'LIABILITY';
            const color = isIncome ? '#2563eb' : isLiability ? '#d97706' : '#dc2626';
            const iconBg = isIncome ? '#eff6ff' : isLiability ? '#fffbeb' : '#fef2f2';

            return (
              <Card key={cat.id} className="gap-2 p-4">
                <View className="flex-row items-start justify-between">
                  <View
                    className="h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Tag size={16} color={color} />
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => openEdit(cat)}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${cat.name}`}
                      className="p-1"
                    >
                      <Pencil size={16} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => confirmDelete(cat.id, cat.name, cat.transactionsCount ?? 0)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${cat.name}`}
                      className="p-1"
                      disabled={(cat.transactionsCount ?? 0) > 0}
                    >
                      <Trash2 size={16} color={(cat.transactionsCount ?? 0) > 0 ? '#cbd5e1' : '#94a3b8'} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="text-sm font-bold leading-[21px] text-slate-900">{cat.name}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[13px] font-extrabold tracking-[0.5px]" style={{ color }}>
                    {cat.type}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <FileText size={12} color="#94a3b8" />
                    <Text className="text-[12px] font-semibold text-slate-500">
                      {cat.transactionsCount ?? 0} transaction(s)
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
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
                {editingCategoryId ? 'Edit Category' : 'Add Category'}
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
            <Text className="mb-1.5 text-[14px] font-bold text-slate-600">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              placeholder="Category name"
              placeholderTextColor="#94a3b8"
              className="mb-4 rounded-lg border border-slate-300 px-3 py-3 text-[16px] text-slate-900"
            />

            <Text className="mb-2 text-[14px] font-bold text-slate-600">Type</Text>
            <View className="mb-4 flex-row gap-2">
              {(['EXPENSE', 'INCOME', 'LIABILITY'] as const).map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setType(value)}
                  className={`flex-1 items-center rounded-lg border px-2 py-2 ${type === value ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}
                  activeOpacity={1}
                >
                  <Text className={`text-[13px] font-semibold ${type === value ? 'text-blue-700' : 'text-slate-600'}`}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[16px] text-slate-700">Tuition / charity category</Text>
              <Switch value={isTuition} onValueChange={setIsTuition} />
            </View>
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-[16px] text-slate-700">Other transactions category</Text>
              <Switch value={isOther} onValueChange={setIsOther} />
            </View>
            </ScrollView>

            <TouchableOpacity onPress={() => void handleSave()} className="items-center rounded-lg bg-blue-700 py-3" activeOpacity={1}>
              <Text className="text-[16px] font-bold text-white">
                {editingCategoryId ? 'Save Changes' : 'Save Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
