import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Tag, Search } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RNCard } from '../components/NativeComponents';

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
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Tag size={20} color="#1e293b" />
          <Text style={styles.titleText}>Categories</Text>
        </View>
        <Text style={styles.subtitleText}>Manage income and expense categories.</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={16} color="#94a3b8" />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search categories..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
        />
      </View>

      {/* Type Filter */}
      <View style={styles.typeRow}>
        {['All', 'Expense', 'Income', 'Liability'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setSelectedType(t)}
            style={[styles.typeBtn, selectedType === t && styles.typeBtnActive]}
          >
            <Text style={[styles.typeBtnText, selectedType === t && styles.typeBtnTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories Cards */}
      <View style={styles.categoriesGrid}>
        {filtered.map((cat) => {
          const isInc = cat.type === 'INCOME';
          const isLiab = cat.type === 'LIABILITY';

          return (
            <RNCard key={cat.id} style={styles.catCard}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isInc ? '#eff6ff' : isLiab ? '#fffbeb' : '#fef2f2',
                  },
                ]}
              >
                <Tag
                  size={16}
                  color={isInc ? '#2563eb' : isLiab ? '#d97706' : '#dc2626'}
                />
              </View>

              <Text style={styles.catName}>{cat.name}</Text>
              <Text
                style={[
                  styles.catTypeTag,
                  {
                    color: isInc ? '#2563eb' : isLiab ? '#d97706' : '#dc2626',
                  },
                ]}
              >
                {cat.type}
              </Text>
            </RNCard>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },
  header: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748b',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeBtnActive: {
    backgroundColor: '#1a56db',
    borderColor: '#1a56db',
  },
  typeBtnText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#ffffff',
  },
  categoriesGrid: {
    gap: 10,
  },
  catCard: {
    padding: 16,
    gap: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 18,
  },
  catTypeTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
