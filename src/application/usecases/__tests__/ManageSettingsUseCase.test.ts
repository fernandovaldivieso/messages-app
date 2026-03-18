import { ManageSettingsUseCase } from '../ManageSettingsUseCase';
import { ISettingsRepository } from '../../../domain/repositories/ISettingsRepository';
import { ITelegramClient } from '../../../domain/repositories/ITelegramClient';
import { Settings } from '../../../domain/entities/Settings';

function makeSettingsRepo(s: Settings | null = null): jest.Mocked<ISettingsRepository> {
  let stored = s;
  return {
    get: jest.fn(async () => stored),
    save: jest.fn(async (settings) => { stored = settings; }),
  };
}

function makeTelegram(): jest.Mocked<ITelegramClient> {
  return { sendMessage: jest.fn(async () => {}) };
}

describe('ManageSettingsUseCase', () => {
  it('returns null when no settings stored', async () => {
    const uc = new ManageSettingsUseCase(makeSettingsRepo(null), makeTelegram());
    expect(await uc.getSettings()).toBeNull();
  });

  it('saves settings with encoded token', async () => {
    const repo = makeSettingsRepo();
    const uc = new ManageSettingsUseCase(repo, makeTelegram());
    await uc.saveSettings('mytoken', 'chat123');
    const saved = await repo.get();
    expect(saved).not.toBeNull();
    expect(saved!.chatId).toBe('chat123');
    expect(Buffer.from(saved!.botTokenEncoded, 'base64').toString()).toBe('mytoken');
  });

  it('token is never stored as plain text', async () => {
    const repo = makeSettingsRepo();
    const uc = new ManageSettingsUseCase(repo, makeTelegram());
    await uc.saveSettings('secret-token', 'chat1');
    const saved = await repo.get();
    expect(saved!.botTokenEncoded).not.toBe('secret-token');
  });

  it('sendTestMessage calls telegram with encoded token', async () => {
    const telegram = makeTelegram();
    const uc = new ManageSettingsUseCase(makeSettingsRepo(), telegram);
    await uc.sendTestMessage('mytoken', 'chat1');
    expect(telegram.sendMessage).toHaveBeenCalledTimes(1);
    const [encodedToken, chatId, msg] = telegram.sendMessage.mock.calls[0];
    expect(Buffer.from(encodedToken, 'base64').toString()).toBe('mytoken');
    expect(chatId).toBe('chat1');
    expect(msg).toContain('Test message');
  });

  it('decodeBotToken correctly decodes', async () => {
    const uc = new ManageSettingsUseCase(makeSettingsRepo(), makeTelegram());
    const encoded = Buffer.from('hello').toString('base64');
    expect(uc.decodeBotToken(encoded)).toBe('hello');
  });

  it('propagates telegram errors from sendTestMessage', async () => {
    const telegram = makeTelegram();
    telegram.sendMessage.mockRejectedValue(new Error('API error'));
    const uc = new ManageSettingsUseCase(makeSettingsRepo(), telegram);
    await expect(uc.sendTestMessage('tok', 'chat')).rejects.toThrow('API error');
  });
});
