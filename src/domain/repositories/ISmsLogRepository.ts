import { SmsLog } from '../entities/SmsLog';

export interface ISmsLogRepository {
  getRecent(limit: number): Promise<SmsLog[]>;
  save(log: SmsLog): Promise<void>;
}
