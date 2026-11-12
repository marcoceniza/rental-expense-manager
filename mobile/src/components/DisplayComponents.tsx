import React from 'react';
import { View, Text, type StyleProp, type ViewStyle } from 'react-native';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`rounded-2xl border border-slate-200 bg-white p-[18px] ${className}`}>
      {children}
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View className="items-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6">
      <Text className="text-center text-[13.5px] text-slate-400">{message}</Text>
    </View>
  );
}

const badgeVariants = {
  DEFAULT: { container: 'border-slate-200 bg-slate-100', label: 'text-slate-600' },
  INCOME: { container: 'border-blue-200 bg-blue-50', label: 'text-blue-600' },
  EXPENSE: { container: 'border-red-200 bg-red-50', label: 'text-red-600' },
  LIABILITY: { container: 'border-amber-200 bg-amber-50', label: 'text-amber-600' },
  SUCCESS: { container: 'border-emerald-200 bg-emerald-50', label: 'text-emerald-600' },
} as const;

export function Badge({
  label,
  type = 'DEFAULT',
  numberOfLines,
  ellipsizeMode,
  style,
}: {
  label: string;
  type?: keyof typeof badgeVariants;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      className={`self-start rounded-xl border px-2 py-[3px] ${badgeVariants[type].container}`}
      style={style}
    >
      <Text
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        className={`text-[13px] font-bold tracking-[0.3px] ${badgeVariants[type].label}`}
      >
        {label}
      </Text>
    </View>
  );
}

export function StatCard({
  title,
  amount,
  icon,
  iconBg = '#eff6ff',
  className = '',
}: {
  title: string;
  amount: string;
  icon: React.ReactNode;
  iconBg?: string;
  className?: string;
}) {
  return (
    <View className={`min-w-[160px] flex-1 rounded-2xl border border-slate-200 bg-white p-[18px] ${className}`}>
      <View
        className="mb-3 h-[38px] w-[38px] items-center justify-center rounded-[10px]"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <View className="gap-0.5">
        <Text className="text-[13px] font-bold uppercase tracking-[0.8px] text-slate-400">
          {title}
        </Text>
        <Text className="text-xl font-extrabold text-slate-900">
          {amount}
        </Text>
      </View>
    </View>
  );
}
