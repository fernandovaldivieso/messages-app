import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../../domain/entities/Settings';
import { ISettingsRepository } from '../../domain/repositories/ISettingsRepository';

const SETTINGS_KEY = '@sms_forwarder:settings';

export class AsyncStorageSettingsRepository implements ISettingsRepository {
  async get(): Promise<Settings | null> {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!json) return null;
    return JSON.parse(json) as Settings;
  }

  async save(settings: Settings): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}
