import { ProcessSmsUseCase, IncomingSms } from '../ProcessSmsUseCase';
import { IRuleRepository } from '../../../domain/repositories/IRuleRepository';
import { ISmsLogRepository } from '../../../domain/repositories/ISmsLogRepository';
import { ISettingsRepository } from '../../../domain/repositories/ISettingsRepository';
import { ITelegramClient } from '../../../domain/repositories/ITelegramClient';
import { Rule } from '../../../domain/entities/Rule';
import { SmsLog } from '../../../domain/entities/SmsLog';
import { Settings } from '../../../domain/entities/Settings';

function makeRuleRepo(rules: Rule[]): jest.Mocked<IRuleRepository> {
  return {
    getAll: jest.fn(async () => rules),
    getById: jest.fn(async (id) => rules.find(r => r.id === id) ?? null),
    save: jest.fn(async () => {}),
    delete: jest.fn(async () => {}),
  };
}

function makeLogRepo(): jest.Mocked<ISmsLogRepository> {
  const logs: SmsLog[] = [];
  return {
    getRecent: jest.fn(async (limit) => logs.slice(0, limit)),
    save: jest.fn(async (log) => { logs.unshift(log); }),
  };
}

function makeSettingsRepo(s: Settings | null): jest.Mocked<ISettingsRepository> {
  return {
    get: jest.fn(async () => s),
    save: jest.fn(async () => {}),
  };
}

function makeTelegramClient(): jest.Mocked<ITelegramClient> {
  return { sendMessage: jest.fn(async () => {}) };
}

const textRule: Rule = {
  id: 'r1', name: 'OTP Rule', targetField: 'body', pattern: 'OTP',
  patternType: 'text', isActive: true, createdAt: 0,
};
const regexRule: Rule = {
  id: 'r2', name: 'Code Rule', targetField: 'body', pattern: '\\d{6}',
  patternType: 'regex', isActive: true, createdAt: 0,
};
const inactiveRule: Rule = {
  id: 'r3', name: 'Inactive', targetField: 'body', pattern: 'match',
  patternType: 'text', isActive: false, createdAt: 0,
};

const settings: Settings = {
  botTokenEncoded: Buffer.from('test-token').toString('base64'),
  chatId: '12345',
};

const sms: IncomingSms = { sender: '+1234567890', body: 'Your OTP is 123456', timestamp: 1000 };

describe('ProcessSmsUseCase', () => {
  it('logs as filtered when no active rules match', async () => {
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([]),
      makeLogRepo(),
      makeSettingsRepo(settings),
      makeTelegramClient(),
    );
    const log = await uc.execute({ sender: 'foo', body: 'no match', timestamp: 0 });
    expect(log.status).toBe('filtered');
  });

  it('logs as filtered when only inactive rules match', async () => {
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([inactiveRule]),
      makeLogRepo(),
      makeSettingsRepo(settings),
      makeTelegramClient(),
    );
    const log = await uc.execute({ sender: 'foo', body: 'match here', timestamp: 0 });
    expect(log.status).toBe('filtered');
  });

  it('matches text rule and forwards', async () => {
    const telegram = makeTelegramClient();
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([textRule]),
      makeLogRepo(),
      makeSettingsRepo(settings),
      telegram,
    );
    const log = await uc.execute(sms);
    expect(log.status).toBe('forwarded');
    expect(telegram.sendMessage).toHaveBeenCalled();
  });

  it('matches regex rule and forwards', async () => {
    const telegram = makeTelegramClient();
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([regexRule]),
      makeLogRepo(),
      makeSettingsRepo(settings),
      telegram,
    );
    const log = await uc.execute(sms);
    expect(log.status).toBe('forwarded');
    expect(telegram.sendMessage).toHaveBeenCalled();
  });

  it('logs error when settings not configured', async () => {
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([textRule]),
      makeLogRepo(),
      makeSettingsRepo(null),
      makeTelegramClient(),
    );
    const log = await uc.execute(sms);
    expect(log.status).toBe('error');
    expect(log.errorReason).toContain('not configured');
  });

  it('logs error when telegram throws', async () => {
    const telegram = makeTelegramClient();
    telegram.sendMessage.mockRejectedValue(new Error('Network failed'));
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([textRule]),
      makeLogRepo(),
      makeSettingsRepo(settings),
      telegram,
    );
    const log = await uc.execute(sms);
    expect(log.status).toBe('error');
    expect(log.errorReason).toBe('Network failed');
  });

  it('matches sender field rule', async () => {
    const senderRule: Rule = {
      id: 'r4', name: 'Bank', targetField: 'sender', pattern: 'BANK',
      patternType: 'text', isActive: true, createdAt: 0,
    };
    const telegram = makeTelegramClient();
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([senderRule]),
      makeLogRepo(),
      makeSettingsRepo(settings),
      telegram,
    );
    const log = await uc.execute({ sender: 'MYBANK', body: 'Transaction alert', timestamp: 0 });
    expect(log.status).toBe('forwarded');
  });

  it('handles invalid regex gracefully (no match)', async () => {
    const badRegexRule: Rule = {
      id: 'r5', name: 'Bad Regex', targetField: 'body', pattern: '[invalid',
      patternType: 'regex', isActive: true, createdAt: 0,
    };
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([badRegexRule]),
      makeLogRepo(),
      makeSettingsRepo(settings),
      makeTelegramClient(),
    );
    const log = await uc.execute({ sender: 'foo', body: 'hello', timestamp: 0 });
    expect(log.status).toBe('filtered');
  });

  it('saves log to repository', async () => {
    const logRepo = makeLogRepo();
    const uc = new ProcessSmsUseCase(
      makeRuleRepo([]),
      logRepo,
      makeSettingsRepo(null),
      makeTelegramClient(),
    );
    await uc.execute({ sender: 'x', body: 'y', timestamp: 0 });
    expect(logRepo.save).toHaveBeenCalledTimes(1);
  });
});
