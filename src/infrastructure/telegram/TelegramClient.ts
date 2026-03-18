import { ITelegramClient } from '../../domain/repositories/ITelegramClient';

export class TelegramClient implements ITelegramClient {
  async sendMessage(botTokenEncoded: string, chatId: string, text: string): Promise<void> {
    const token = Buffer.from(botTokenEncoded, 'base64').toString('utf-8');
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Telegram API error ${response.status}: ${errBody}`);
    }
  }
}
