export interface ITelegramClient {
  sendMessage(botTokenEncoded: string, chatId: string, text: string): Promise<void>;
}
