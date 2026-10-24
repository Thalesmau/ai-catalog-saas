import type { ChatMessage } from './types';

const PREFIX = 'catalog-ai:chat:';

export const chatStorage = {
  load(accountId: string): ChatMessage[] {
    try {
      const raw = sessionStorage.getItem(PREFIX + accountId);
      const messages = raw ? (JSON.parse(raw) as ChatMessage[]) : [];

      return messages.map(message =>
        message.role === 'assistant' && message.status === 'streaming' ? { ...message, status: 'stopped' } : message);
    } catch {
      return [];
    }
  },
  save(accountId: string, messages: ChatMessage[]) {
    try {
      sessionStorage.setItem(PREFIX + accountId, JSON.stringify(messages));
    } catch {
    }
  },
  clearAll() {
    try {
      Object.keys(sessionStorage)
        .filter(key => key.startsWith(PREFIX))
        .forEach(key => sessionStorage.removeItem(key));
    } catch {
    }
  },
};
