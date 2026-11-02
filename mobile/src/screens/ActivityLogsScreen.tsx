import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { FileText, Search, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RNCard, RNBadge } from '../components/NativeComponents';

export default function ActivityLogsScreen() {
  const { activityLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activityLogs.filter((log) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        log.description.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.ipAddress.includes(q)
      );
    }
    return true;
  });

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FileText size={20} color="#1e293b" />
          <Text style={styles.titleText}>Activity Logs</Text>
        </View>
        <Text style={styles.subtitleText}>
          Track all system activities including logins, transactions, and configuration changes.
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={16} color="#94a3b8" />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search logs..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.logsList}>
        {filtered.map((item) => {
          const isExp = expandedId === item.id;
          return (
            <RNCard key={item.id} style={styles.logCard}>
              <View style={styles.logTop}>
                <View style={styles.userCol}>
                  <Text style={styles.userName}>{item.user}</Text>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
                <RNBadge label={item.action} type="SUCCESS" />
              </View>

              <Text style={styles.descText}>{item.description}</Text>

              <View style={styles.logBottom}>
                <View style={styles.ipTag}>
                  <Text style={styles.ipText}>{item.ipAddress}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setExpandedId(isExp ? null : item.id)}
                  style={styles.detailsBtn}
                >
                  <Text style={styles.detailsBtnText}>Details</Text>
                  {isExp ? (
                    <ChevronUp size={14} color="#2563eb" />
                  ) : (
                    <ChevronDown size={14} color="#2563eb" />
                  )}
                </TouchableOpacity>
              </View>

              {isExp && (
                <View style={styles.detailsPanel}>
                  <Text style={styles.detailsTitle}>HTTP Audit Event</Text>
                  <Text style={styles.detailsLine}>User: {item.email}</Text>
                  <Text style={styles.detailsLine}>Status: {item.details?.status || '200 OK'}</Text>
                  {item.details?.userAgent && (
                    <Text style={styles.detailsAgent} numberOfLines={2}>
                      {item.details.userAgent}
                    </Text>
                  )}
                </View>
              )}
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
  logsList: {
    gap: 10,
  },
  logCard: {
    padding: 14,
    gap: 8,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCol: {
    gap: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  timestamp: {
    fontSize: 10,
    color: '#94a3b8',
  },
  descText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  logBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  ipTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ipText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#475569',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a56db',
  },
  detailsPanel: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    gap: 3,
  },
  detailsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailsLine: {
    fontSize: 10,
    color: '#64748b',
  },
  detailsAgent: {
    fontSize: 9,
    color: '#94a3b8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
