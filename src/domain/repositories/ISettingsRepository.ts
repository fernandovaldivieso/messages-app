import { Settings } from '../entities/Settings';

export interface ISettingsRepository {
  get(): Promise<Settings | null>;
  save(settings: Settings): Promise<void>;
}
