import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rule } from '../../domain/entities/Rule';
import { IRuleRepository } from '../../domain/repositories/IRuleRepository';

const RULES_KEY = '@sms_forwarder:rules';

export class AsyncStorageRuleRepository implements IRuleRepository {
  async getAll(): Promise<Rule[]> {
    const json = await AsyncStorage.getItem(RULES_KEY);
    if (!json) return [];
    return JSON.parse(json) as Rule[];
  }

  async getById(id: string): Promise<Rule | null> {
    const rules = await this.getAll();
    return rules.find(r => r.id === id) ?? null;
  }

  async save(rule: Rule): Promise<void> {
    const rules = await this.getAll();
    const idx = rules.findIndex(r => r.id === rule.id);
    if (idx >= 0) {
      rules[idx] = rule;
    } else {
      rules.push(rule);
    }
    await AsyncStorage.setItem(RULES_KEY, JSON.stringify(rules));
  }

  async delete(id: string): Promise<void> {
    const rules = await this.getAll();
    const filtered = rules.filter(r => r.id !== id);
    await AsyncStorage.setItem(RULES_KEY, JSON.stringify(filtered));
  }
}
