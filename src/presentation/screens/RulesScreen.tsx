import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal,
  TextInput, Switch, ScrollView,
} from 'react-native';
import { Rule, TargetField, PatternType } from '../../domain/entities/Rule';
import { manageRulesUseCase } from '../../infrastructure/di/container';

interface RuleFormData {
  name: string;
  targetField: TargetField;
  pattern: string;
  patternType: PatternType;
}

const defaultForm: RuleFormData = {
  name: '',
  targetField: 'body',
  pattern: '',
  patternType: 'text',
};

export default function RulesScreen() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [form, setForm] = useState<RuleFormData>(defaultForm);

  const loadRules = useCallback(async () => {
    const all = await manageRulesUseCase.getAllRules();
    setRules(all);
  }, []);

  useEffect(() => { loadRules(); }, [loadRules]);

  const openCreate = () => {
    setEditingRule(null);
    setForm(defaultForm);
    setModalVisible(true);
  };

  const openEdit = (rule: Rule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      targetField: rule.targetField,
      pattern: rule.pattern,
      patternType: rule.patternType,
    });
    setModalVisible(true);
  };

  const saveRule = async () => {
    if (!form.name.trim() || !form.pattern.trim()) {
      Alert.alert('Validation', 'Name and pattern are required.');
      return;
    }
    if (editingRule) {
      await manageRulesUseCase.updateRule(editingRule.id, form);
    } else {
      await manageRulesUseCase.createRule(form);
    }
    setModalVisible(false);
    loadRules();
  };

  const deleteRule = (id: string) => {
    Alert.alert('Delete Rule', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await manageRulesUseCase.deleteRule(id);
          loadRules();
        },
      },
    ]);
  };

  const toggleRule = async (id: string) => {
    await manageRulesUseCase.toggleRule(id);
    loadRules();
  };

  const renderItem = ({ item }: { item: Rule }) => (
    <View style={styles.ruleItem}>
      <View style={styles.ruleHeader}>
        <Text style={styles.ruleName}>{item.name}</Text>
        <Switch value={item.isActive} onValueChange={() => toggleRule(item.id)} />
      </View>
      <Text style={styles.ruleDetail}>
        Field: {item.targetField} | Type: {item.patternType}
      </Text>
      <Text style={styles.rulePattern}>Pattern: {item.pattern}</Text>
      <View style={styles.ruleActions}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteRule(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openCreate}>
        <Text style={styles.addButtonText}>+ Add Rule</Text>
      </TouchableOpacity>
      <FlatList
        data={rules}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No rules yet. Tap "+ Add Rule" to create one.</Text>}
      />
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>{editingRule ? 'Edit Rule' : 'New Rule'}</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={v => setForm(f => ({ ...f, name: v }))}
            placeholder="Rule name"
          />
          <Text style={styles.label}>Target Field</Text>
          <View style={styles.toggleRow}>
            {(['sender', 'body'] as TargetField[]).map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.toggleBtn, form.targetField === f && styles.toggleBtnActive]}
                onPress={() => setForm(p => ({ ...p, targetField: f }))}
              >
                <Text style={form.targetField === f ? styles.toggleBtnTextActive : styles.toggleBtnText}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Pattern Type</Text>
          <View style={styles.toggleRow}>
            {(['text', 'regex'] as PatternType[]).map(pt => (
              <TouchableOpacity
                key={pt}
                style={[styles.toggleBtn, form.patternType === pt && styles.toggleBtnActive]}
                onPress={() => setForm(p => ({ ...p, patternType: pt }))}
              >
                <Text style={form.patternType === pt ? styles.toggleBtnTextActive : styles.toggleBtnText}>
                  {pt.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Pattern</Text>
          <TextInput
            style={styles.input}
            value={form.pattern}
            onChangeText={v => setForm(f => ({ ...f, pattern: v }))}
            placeholder="e.g. OTP or \d{6}"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={saveRule}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  addButton: {
    backgroundColor: '#3498db', margin: 12, padding: 12, borderRadius: 6, alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ruleItem: {
    backgroundColor: '#fff', padding: 12, marginHorizontal: 8, marginVertical: 4,
    borderRadius: 6, elevation: 1,
  },
  ruleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ruleName: { fontWeight: '700', fontSize: 15, flex: 1 },
  ruleDetail: { color: '#777', fontSize: 12, marginTop: 4 },
  rulePattern: { color: '#333', fontSize: 13, marginTop: 2 },
  ruleActions: { flexDirection: 'row', marginTop: 8, gap: 8 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, backgroundColor: '#3498db' },
  editBtnText: { color: '#fff', fontSize: 12 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, backgroundColor: '#e74c3c' },
  deleteBtnText: { color: '#fff', fontSize: 12 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  modal: { flex: 1, padding: 20, backgroundColor: '#fff' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, marginTop: 40 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10,
    fontSize: 14, backgroundColor: '#fafafa',
  },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  toggleBtnText: { color: '#333' },
  toggleBtnTextActive: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#27ae60', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#e74c3c', fontSize: 15 },
});
