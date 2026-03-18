import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { manageSettingsUseCase } from '../../infrastructure/di/container';

export default function SettingsScreen() {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const s = await manageSettingsUseCase.getSettings();
      if (s) {
        setBotToken(manageSettingsUseCase.decodeBotToken(s.botTokenEncoded));
        setChatId(s.chatId);
      }
    };
    load();
  }, []);

  const save = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      Alert.alert('Validation', 'Bot token and Chat ID are required.');
      return;
    }
    setSaving(true);
    try {
      await manageSettingsUseCase.saveSettings(botToken.trim(), chatId.trim());
      Alert.alert('Saved', 'Settings saved successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      Alert.alert('Validation', 'Bot token and Chat ID are required.');
      return;
    }
    setLoading(true);
    try {
      await manageSettingsUseCase.sendTestMessage(botToken.trim(), chatId.trim());
      Alert.alert('Success', 'Test message sent to Telegram!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Failed', `Could not send test message: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Telegram Configuration</Text>
      <Text style={styles.label}>Bot Token</Text>
      <TextInput
        style={styles.input}
        value={botToken}
        onChangeText={setBotToken}
        placeholder="123456:ABC-DEF..."
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>Chat ID</Text>
      <TextInput
        style={styles.input}
        value={chatId}
        onChangeText={setChatId}
        placeholder="-100123456789"
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Settings</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.testBtn} onPress={sendTest} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.testBtnText}>Send Test Message</Text>}
      </TouchableOpacity>
      <Text style={styles.hint}>
        ℹ Token is stored base64-encoded and never logged to console.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10,
    fontSize: 14, backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#27ae60', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  testBtn: {
    backgroundColor: '#3498db', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 12,
  },
  testBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint: { color: '#999', fontSize: 12, marginTop: 16, textAlign: 'center' },
});
