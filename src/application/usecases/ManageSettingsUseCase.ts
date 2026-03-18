import { Settings } from '../../domain/entities/Settings';
import { ISettingsRepository } from '../../domain/repositories/ISettingsRepository';
import { ITelegramClient } from '../../domain/repositories/ITelegramClient';

export class ManageSettingsUseCase {
  constructor(
    private readonly settingsRepo: ISettingsRepository,
    private readonly telegramClient: ITelegramClient,
  ) {}

  async getSettings(): Promise<Settings | null> {
    return this.settingsRepo.get();
  }

  async saveSettings(botToken: string, chatId: string): Promise<void> {
    const botTokenEncoded = Buffer.from(botToken).toString('base64');
    const settings: Settings = { botTokenEncoded, chatId };
    await this.settingsRepo.save(settings);
  }

  async sendTestMessage(botToken: string, chatId: string): Promise<void> {
    const botTokenEncoded = Buffer.from(botToken).toString('base64');
    await this.telegramClient.sendMessage(botTokenEncoded, chatId, 'SMS Forwarder: Test message ✅');
  }

  decodeBotToken(encoded: string): string {
    return Buffer.from(encoded, 'base64').toString('utf-8');
  }
}
