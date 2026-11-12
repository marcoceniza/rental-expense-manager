import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { FileText, Search, ChevronDown, ChevronUp, Calendar } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Card, Badge, EmptyState } from '../components/DisplayComponents';

export default function ActivityLogsScreen() {
  const { activityLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const uniqueActions = useMemo(() => [...new Set(activityLogs.map((l) => l.action))].sort(), [activityLogs]);
  const uniqueUsers = useMemo(() => [...new Set(activityLogs.map((l) => l.user))].sort(), [activityLogs]);

  const filtered = useMemo(() => {
    let result = activityLogs;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          (log.description ?? '').toLowerCase().includes(query) ||
          log.user.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.ipAddress.includes(query) ||
          log.email.toLowerCase().includes(query),
      );
    }

    if (fromDate) {
      result = result.filter((log) => log.timestamp >= fromDate);
    }
    if (toDate) {
      result = result.filter((log) => log.timestamp <= toDate);
    }

    if (actionFilter) {
      result = result.filter((log) => log.action === actionFilter);
    }

    if (userFilter) {
      result = result.filter((log) => log.user === userFilter);
    }

    return result;
  }, [activityLogs, searchTerm, fromDate, toDate, actionFilter, userFilter]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setActionFilter('');
    setUserFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(fromDate || toDate || actionFilter || userFilter || searchTerm);

  const getActionType = (action: string): 'SUCCESS' | 'DEFAULT' | 'INCOME' | 'EXPENSE' | 'LIABILITY' => {
    const lower = action.toLowerCase();
    if (lower.includes('create')) return 'INCOME';
    if (lower.includes('update')) return 'DEFAULT';
    if (lower.includes('delete')) return 'EXPENSE';
    return 'SUCCESS';
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View className="gap-3.5 px-4 pb-9 pt-4">
        {/* Header */}
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            <FileText size={20} color="#1e293b" />
            <Text className="text-xl font-extrabold text-slate-900">Activity Logs</Text>
          </View>
          <Text className="text-xs text-slate-500">
            Track all system activities including logins, transactions, and configuration changes.
          </Text>
        </View>

        {/* Search + Filters */}
        <View className="gap-2.5">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2">
              <Search size={16} color="#94a3b8" />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoCapitalize="none"
                placeholder="Search logs..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-[16px] text-slate-900"
              />
              {hasActiveFilters && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text className="text-[14px] font-bold text-red-500">Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              className={`flex-row items-center gap-1.5 rounded-[10px] border px-3 py-2 ${
                showFilters ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'
              }`}
            >
              <Search size={16} color={showFilters ? '#2563eb' : '#94a3b8'} />
              <Text className={`text-[14px] font-bold ${showFilters ? 'text-blue-700' : 'text-slate-500'}`}>
                {showFilters ? 'Hide' : 'Filter'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter panel */}
          {showFilters && (
            <View className="rounded-[10px] border border-slate-200 bg-white p-3">
              <View className="flex-row flex-wrap gap-2.5">
                <View className="flex-1 gap-1.5">
                  <Text className="text-[12px] font-bold uppercase text-slate-400">Date Range</Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Text className="mb-1 text-[11px] font-semibold text-slate-500">From</Text>
                      <View className="flex-row items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                        <Calendar size={12} color="#94a3b8" />
                        <TextInput
                          value={fromDate}
                          onChangeText={setFromDate}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="#94a3b8"
                          className="flex-1 text-[13px]"
                        />
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-[11px] font-semibold text-slate-500">To</Text>
                      <View className="flex-row items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                        <Calendar size={12} color="#94a3b8" />
                        <TextInput
                          value={toDate}
                          onChangeText={setToDate}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="#94a3b8"
                          className="flex-1 text-[13px]"
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="text-[12px] font-bold uppercase text-slate-400">Action</Text>
                  <View className="flex-row items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                    <View className="flex-1">
                      <TextInput
                        value={actionFilter}
                        onChangeText={setActionFilter}
                        placeholder="All actions"
                        placeholderTextColor="#94a3b8"
                        className="text-[13px]"
                      />
                    </View>
                  </View>
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="text-[12px] font-bold uppercase text-slate-400">User</Text>
                  <View className="flex-row items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                    <View className="flex-1">
                      <TextInput
                        value={userFilter}
                        onChangeText={setUserFilter}
                        placeholder="All users"
                        placeholderTextColor="#94a3b8"
                        className="text-[13px]"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Results count */}
        <Text className="text-[13px] font-bold text-slate-400">
          Showing {paginatedLogs.length} of {filtered.length} logs
        </Text>

        {/* Logs */}
        <View className="gap-2.5">
          {filtered.length === 0 ? (
            <EmptyState
              message={
                activityLogs.length === 0
                  ? 'No activity logs have been recorded yet.'
                  : 'No activity logs match your filters.'
              }
            />
          ) : (
            paginatedLogs.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <Card key={item.id} className="gap-2 p-3.5">
                  <View className="flex-row items-center justify-between">
                    <View className="gap-px">
                      <Text className="text-[16px] font-bold text-slate-900">{item.user}</Text>
                      <Text className="text-[13px] text-slate-400">{item.timestamp}</Text>
                    </View>
                    <Badge label={item.action} type={getActionType(item.action)} />
                  </View>

                  <Text className="text-xs font-medium text-slate-700">{item.description ?? ''}</Text>

                  <View className="flex-row items-center justify-between border-t border-slate-50 pt-1.5">
                    <View className="rounded bg-slate-100 px-1.5 py-0.5">
                      <Text className="font-mono text-[13px] text-slate-600">{item.ipAddress}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex-row items-center gap-0.5"
                    >
                      <Text className="text-[14px] font-bold text-blue-700">Details</Text>
                      {isExpanded ? (
                        <ChevronUp size={14} color="#2563eb" />
                      ) : (
                        <ChevronDown size={14} color="#2563eb" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {isExpanded && (
                    <View className="mt-1.5 gap-[3px] rounded-lg bg-slate-50 p-2.5">
                      <Text className="text-[14px] font-bold text-slate-900">Activity Details</Text>
                      <Text className="text-[13px] text-slate-500">User: {item.email}</Text>
                      {item.details?.userAgent && (
                        <Text className="mt-0.5 font-mono text-[12px] text-slate-400" numberOfLines={2}>
                          {item.details.userAgent}
                        </Text>
                      )}
                      {item.details?.payload && (
                        <Text className="mt-0.5 font-mono text-[12px] text-slate-400" numberOfLines={4}>
                          {JSON.stringify(item.details.payload)}
                        </Text>
                      )}
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </View>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Card className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-[14px] font-bold text-slate-600">Rows per page:</Text>
                <View className="flex-row rounded-lg border border-slate-200 bg-white">
                  {[5, 10, 20, 50].map((count) => (
                    <TouchableOpacity
                      key={count}
                      onPress={() => {
                        setRowsPerPage(count);
                        setCurrentPage(1);
                      }}
                      className={`rounded-md px-2.5 py-1 ${rowsPerPage === count ? 'bg-slate-800' : ''}`}
                    >
                      <Text className={`text-[13px] font-bold ${rowsPerPage === count ? 'text-white' : 'text-slate-600'}`}>
                        {count}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row items-center gap-1.5">
                <TouchableOpacity
                  onPress={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`rounded-md px-2 py-1 ${currentPage === 1 ? 'opacity-40' : ''}`}
                >
                  <Text className="text-[13px] font-bold text-blue-700">|&lt;</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`rounded-md px-2 py-1 ${currentPage === 1 ? 'opacity-40' : ''}`}
                >
                  <Text className="text-[13px] font-bold text-blue-700">&lt;</Text>
                </TouchableOpacity>
                <Text className="text-[14px] font-bold text-slate-700">
                  {currentPage} / {totalPages}
                </Text>
                <TouchableOpacity
                  onPress={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`rounded-md px-2 py-1 ${currentPage === totalPages ? 'opacity-40' : ''}`}
                >
                  <Text className="text-[13px] font-bold text-blue-700">&gt;</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`rounded-md px-2 py-1 ${currentPage === totalPages ? 'opacity-40' : ''}`}
                >
                  <Text className="text-[13px] font-bold text-blue-700">&gt;|</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
