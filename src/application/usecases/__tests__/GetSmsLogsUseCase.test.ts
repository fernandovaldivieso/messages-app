import { GetSmsLogsUseCase } from '../GetSmsLogsUseCase';
import { ISmsLogRepository } from '../../../domain/repositories/ISmsLogRepository';
import { SmsLog } from '../../../domain/entities/SmsLog';

function makeLogRepo(logs: SmsLog[]): jest.Mocked<ISmsLogRepository> {
  return {
    getRecent: jest.fn(async (limit) => logs.slice(0, limit)),
    save: jest.fn(async () => {}),
  };
}

const mockLogs: SmsLog[] = Array.from({ length: 60 }, (_, i) => ({
  id: `log_${i}`,
  sender: `+1${i}`,
  body: `Message ${i}`,
  timestamp: i * 1000,
  status: 'forwarded' as const,
}));

describe('GetSmsLogsUseCase', () => {
  it('returns recent logs with default limit 50', async () => {
    const uc = new GetSmsLogsUseCase(makeLogRepo(mockLogs));
    const result = await uc.getRecentLogs();
    expect(result).toHaveLength(50);
  });

  it('returns logs with custom limit', async () => {
    const uc = new GetSmsLogsUseCase(makeLogRepo(mockLogs));
    const result = await uc.getRecentLogs(10);
    expect(result).toHaveLength(10);
  });

  it('returns empty array when no logs', async () => {
    const uc = new GetSmsLogsUseCase(makeLogRepo([]));
    const result = await uc.getRecentLogs();
    expect(result).toHaveLength(0);
  });

  it('delegates to repository', async () => {
    const repo = makeLogRepo(mockLogs);
    const uc = new GetSmsLogsUseCase(repo);
    await uc.getRecentLogs(5);
    expect(repo.getRecent).toHaveBeenCalledWith(5);
  });
});
