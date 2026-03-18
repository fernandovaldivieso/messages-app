import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SmsLog } from '../../domain/entities/SmsLog';
import { getSmsLogsUseCase } from '../../infrastructure/di/container';

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString();
}

function statusColor(status: SmsLog['status']): string {
  switch (status) {
    case 'forwarded': return '#27ae60';
    case 'filtered': return '#7f8c8d';
    case 'error': return '#e74c3c';
  }
}

interface ServiceState {
  isActive: boolean;
}

export default function HomeScreen() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [serviceState, setServiceState] = useState<ServiceState>({ isActive: false });
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    const recent = await getSmsLogsUseCase.getRecentLogs(50);
    setLogs(recent);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const toggleService = () => {
    setServiceState(prev => ({ isActive: !prev.isActive }));
  };

  const renderItem = ({ item }: { item: SmsLog }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={styles.sender}>{item.sender}</Text>
        <Text style={[styles.status, { color: statusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      {item.status === 'error' && item.errorReason && (
        <Text style={styles.errorReason}>⚠ {item.errorReason}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.serviceBar}>
        <View style={styles.serviceInfo}>
          <View style={[styles.indicator, { backgroundColor: serviceState.isActive ? '#27ae60' : '#e74c3c' }]} />
          <Text style={styles.serviceText}>
            Service: {serviceState.isActive ? 'Active' : 'Stopped'}
          </Text>
        </View>
        <TouchableOpacity style={styles.serviceButton} onPress={toggleService}>
          <Text style={styles.serviceButtonText}>
            {serviceState.isActive ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No messages processed yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  serviceBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#ddd',
  },
  serviceInfo: { flexDirection: 'row', alignItems: 'center' },
  indicator: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  serviceText: { fontSize: 14, fontWeight: '600' },
  serviceButton: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 4,
    backgroundColor: '#3498db',
  },
  serviceButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  logItem: {
    backgroundColor: '#fff', padding: 12, marginHorizontal: 8, marginVertical: 4,
    borderRadius: 6, elevation: 1,
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sender: { fontWeight: '700', fontSize: 14 },
  status: { fontSize: 12, fontWeight: '700' },
  body: { color: '#555', fontSize: 13, marginBottom: 4 },
  timestamp: { color: '#999', fontSize: 11 },
  errorReason: { color: '#e74c3c', fontSize: 12, marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
});
