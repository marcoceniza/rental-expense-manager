import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { FileText, Search, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, Badge } from '../components/DisplayComponents';

export default function ActivityLogsScreen() {
  const { activityLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activityLogs.filter((log) => {
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      return (
        log.description.toLowerCase().includes(query) ||
        log.user.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.ipAddress.includes(query)
      );
    }
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
            <FileText size={20} color="#1e293b" />
            <Text className="text-xl font-extrabold text-slate-900">Activity Logs</Text>
          </View>
          <Text className="text-xs text-slate-500">
            Track all system activities including logins, transactions, and configuration changes.
          </Text>
        </View>

        <View className="flex-row items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2">
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search logs..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-[13px] text-slate-900"
          />
        </View>

        <View className="gap-2.5">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <Card key={item.id} className="gap-2 p-3.5">
                <View className="flex-row items-center justify-between">
                  <View className="gap-px">
                    <Text className="text-[13px] font-bold text-slate-900">{item.user}</Text>
                    <Text className="text-[10px] text-slate-400">{item.timestamp}</Text>
                  </View>
                  <Badge label={item.action} type="SUCCESS" />
                </View>

                <Text className="text-xs font-medium text-slate-700">{item.description}</Text>

                <View className="flex-row items-center justify-between border-t border-slate-50 pt-1.5">
                  <View className="rounded bg-slate-100 px-1.5 py-0.5">
                    <Text className="font-mono text-[10px] text-slate-600">{item.ipAddress}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex-row items-center gap-0.5"
                  >
                    <Text className="text-[11px] font-bold text-blue-700">Details</Text>
                    {isExpanded ? (
                      <ChevronUp size={14} color="#2563eb" />
                    ) : (
                      <ChevronDown size={14} color="#2563eb" />
                    )}
                  </TouchableOpacity>
                </View>

                {isExpanded && (
                  <View className="mt-1.5 gap-[3px] rounded-lg bg-slate-50 p-2.5">
                    <Text className="text-[11px] font-bold text-slate-900">HTTP Audit Event</Text>
                    <Text className="text-[10px] text-slate-500">User: {item.email}</Text>
                    <Text className="text-[10px] text-slate-500">
                      Status: {item.details?.status || '200 OK'}
                    </Text>
                    {item.details?.userAgent && (
                      <Text className="mt-0.5 font-mono text-[9px] text-slate-400" numberOfLines={2}>
                        {item.details.userAgent}
                      </Text>
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
