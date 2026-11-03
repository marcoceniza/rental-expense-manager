import React from 'react';
import { View, Text } from 'react-native';

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
}: {
  label: string;
  type?: keyof typeof badgeVariants;
}) {
  return (
    <View className={`self-start rounded-xl border px-2 py-[3px] ${badgeVariants[type].container}`}>
      <Text
        className={`text-[10px] font-bold tracking-[0.3px] ${badgeVariants[type].label}`}
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
        <Text className="text-[10px] font-bold uppercase tracking-[0.8px] text-slate-400">
          {title}
        </Text>
        <Text className="text-xl font-extrabold text-slate-900">
          {amount}
        </Text>
      </View>
    </View>
  );
}
