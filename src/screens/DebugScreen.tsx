import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { audioCache } from '../services/audioCache';
import { errorLogger } from '../services/errorLogger';

export const DebugScreen = () => {
  const [logs, setLogs] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'log'>(
    'all'
  );

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 500);
    return () => clearInterval(interval);
  }, [filter]);

  const refreshLogs = () => {
    const allLogs = errorLogger.getLogs();

    let filtered = allLogs;
    if (filter !== 'all') {
      filtered = allLogs.filter((log) => log.level === filter);
    }

    const formatted = filtered
      .map(
        (log) =>
          `[${log.timestamp}] ${log.level.toUpperCase()} (${log.source})\n${log.message}\n`
      )
      .join('---\n');

    setLogs(formatted || 'No logs yet');
  };

  const handleFilterChange = (
    newFilter: 'all' | 'error' | 'warn' | 'log'
  ) => {
    setFilter(newFilter);
  };

  const handleClearLogs = () => {
    errorLogger.clearLogs();
    setLogs('Logs cleared');
    setTimeout(refreshLogs, 500);
  };

  const handleExport = () => {
    const exported = errorLogger.exportLogs();
    console.log('EXPORTED LOGS:\n' + exported);
    alert(
      'Logs exported to console. Copy from console output.\n\nFirst 300 chars:\n' +
        exported.substring(0, 300)
    );
  };

  const handleClearCache = async () => {
    try {
      await audioCache.clearAllCache();
      alert('Audio cache cleared successfully! All surahs will re-download on next play.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error clearing cache: ${errorMessage}`);
      console.error('Error clearing cache:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Console</Text>

      <View style={styles.filterContainer}>
        {(['all', 'error', 'warn', 'log'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && styles.filterBtnActive,
            ]}
            onPress={() => handleFilterChange(f)}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === f && styles.filterBtnTextActive,
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsText}>{logs}</Text>
      </ScrollView>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.refreshBtn]}
          onPress={refreshLogs}
        >
          <Text style={styles.actionBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.exportBtn]}
          onPress={handleExport}
        >
          <Text style={styles.actionBtnText}>💾 Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.clearBtn]}
          onPress={handleClearLogs}
        >
          <Text style={styles.actionBtnText}>🗑 Clear Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.clearCacheBtn]}
          onPress={handleClearCache}
        >
          <Text style={styles.actionBtnText}>🗑️ Clear Audio Cache</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 5,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#222',
    borderRadius: 5,
  },
  filterBtnActive: {
    backgroundColor: '#00ff00',
  },
  filterBtnText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: '#000',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  logsText: {
    color: '#00ff00',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  refreshBtn: {
    backgroundColor: '#0066ff',
  },
  exportBtn: {
    backgroundColor: '#aa00aa',
  },
  clearBtn: {
    backgroundColor: '#ff0000',
  },
  clearCacheBtn: {
    backgroundColor: '#ff6600',
  },
});
