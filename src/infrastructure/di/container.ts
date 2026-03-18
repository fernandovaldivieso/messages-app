import { AsyncStorageRuleRepository } from '../storage/AsyncStorageRuleRepository';
import { AsyncStorageSmsLogRepository } from '../storage/AsyncStorageSmsLogRepository';
import { AsyncStorageSettingsRepository } from '../storage/AsyncStorageSettingsRepository';
import { TelegramClient } from '../telegram/TelegramClient';
import { ManageRulesUseCase } from '../../application/usecases/ManageRulesUseCase';
import { ProcessSmsUseCase } from '../../application/usecases/ProcessSmsUseCase';
import { ManageSettingsUseCase } from '../../application/usecases/ManageSettingsUseCase';
import { GetSmsLogsUseCase } from '../../application/usecases/GetSmsLogsUseCase';

const ruleRepo = new AsyncStorageRuleRepository();
const logRepo = new AsyncStorageSmsLogRepository();
const settingsRepo = new AsyncStorageSettingsRepository();
const telegramClient = new TelegramClient();

export const manageRulesUseCase = new ManageRulesUseCase(ruleRepo);
export const processSmsUseCase = new ProcessSmsUseCase(ruleRepo, logRepo, settingsRepo, telegramClient);
export const manageSettingsUseCase = new ManageSettingsUseCase(settingsRepo, telegramClient);
export const getSmsLogsUseCase = new GetSmsLogsUseCase(logRepo);
