import { SmsLog } from '../../domain/entities/SmsLog';
import { ISmsLogRepository } from '../../domain/repositories/ISmsLogRepository';

export class GetSmsLogsUseCase {
  constructor(private readonly logRepo: ISmsLogRepository) {}

  async getRecentLogs(limit = 50): Promise<SmsLog[]> {
    return this.logRepo.getRecent(limit);
  }
}
