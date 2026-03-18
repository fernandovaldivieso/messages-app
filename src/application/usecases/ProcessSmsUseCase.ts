import { Rule } from '../../domain/entities/Rule';
import { SmsLog } from '../../domain/entities/SmsLog';
import { IRuleRepository } from '../../domain/repositories/IRuleRepository';
import { ISmsLogRepository } from '../../domain/repositories/ISmsLogRepository';
import { ISettingsRepository } from '../../domain/repositories/ISettingsRepository';
import { ITelegramClient } from '../../domain/repositories/ITelegramClient';

export interface IncomingSms {
  sender: string;
  body: string;
  timestamp: number;
}

export class ProcessSmsUseCase {
  constructor(
    private readonly ruleRepo: IRuleRepository,
    private readonly logRepo: ISmsLogRepository,
    private readonly settingsRepo: ISettingsRepository,
    private readonly telegramClient: ITelegramClient,
  ) {}

  async execute(sms: IncomingSms): Promise<SmsLog> {
    const rules = await this.ruleRepo.getAll();
    const activeRules = rules.filter(r => r.isActive);
    const matchedRule = activeRules.find(r => this.matchesRule(sms, r));

    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!matchedRule) {
      const log: SmsLog = {
        id: logId,
        sender: sms.sender,
        body: sms.body,
        timestamp: sms.timestamp,
        status: 'filtered',
      };
      await this.logRepo.save(log);
      return log;
    }

    const settings = await this.settingsRepo.get();
    if (!settings || !settings.botTokenEncoded || !settings.chatId) {
      const log: SmsLog = {
        id: logId,
        sender: sms.sender,
        body: sms.body,
        timestamp: sms.timestamp,
        status: 'error',
        errorReason: 'Telegram not configured',
        matchedRuleId: matchedRule.id,
      };
      await this.logRepo.save(log);
      return log;
    }

    try {
      const message = `From: ${sms.sender}\n${sms.body}`;
      await this.telegramClient.sendMessage(settings.botTokenEncoded, settings.chatId, message);
      const log: SmsLog = {
        id: logId,
        sender: sms.sender,
        body: sms.body,
        timestamp: sms.timestamp,
        status: 'forwarded',
        matchedRuleId: matchedRule.id,
      };
      await this.logRepo.save(log);
      return log;
    } catch (err: unknown) {
      const errorReason = err instanceof Error ? err.message : 'Unknown error';
      const log: SmsLog = {
        id: logId,
        sender: sms.sender,
        body: sms.body,
        timestamp: sms.timestamp,
        status: 'error',
        errorReason,
        matchedRuleId: matchedRule.id,
      };
      await this.logRepo.save(log);
      return log;
    }
  }

  private matchesRule(sms: IncomingSms, rule: Rule): boolean {
    const target = rule.targetField === 'sender' ? sms.sender : sms.body;
    if (rule.patternType === 'regex') {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        return regex.test(target);
      } catch {
        return false;
      }
    }
    return target.toLowerCase().includes(rule.pattern.toLowerCase());
  }
}
