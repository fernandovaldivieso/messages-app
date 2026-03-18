import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmsLog } from '../../domain/entities/SmsLog';
import { ISmsLogRepository } from '../../domain/repositories/ISmsLogRepository';

const LOGS_KEY = '@sms_forwarder:logs';
const MAX_LOGS = 50;

export class AsyncStorageSmsLogRepository implements ISmsLogRepository {
  async getRecent(limit: number): Promise<SmsLog[]> {
    const json = await AsyncStorage.getItem(LOGS_KEY);
    if (!json) return [];
    const logs = JSON.parse(json) as SmsLog[];
    return logs.slice(0, limit);
  }

  async save(log: SmsLog): Promise<void> {
    const logs = await this.getRecent(MAX_LOGS);
    const updated = [log, ...logs].slice(0, MAX_LOGS);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  }
}
