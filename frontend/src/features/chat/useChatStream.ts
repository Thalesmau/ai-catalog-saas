import { useCallback, useEffect, useRef, useState } from 'react';

import { useSession } from '@/features/auth/authContext';
import { ApiError } from '@/lib/http';
import { postSse } from '@/lib/sse';

import { chatStorage } from './chatStorage';
import type { AssistantMessage, ChatEvent, ChatMessage } from './types';

const MAX_HISTORY = 20;
const MAX_CONTENT_LENGTH = 4000;

function toHistory(messages: ChatMessage[]) {
  return messages
    .filter(message => message.role === 'user' || (message.status === 'done' && message.content))
    .slice(-MAX_HISTORY)
    .map(message => ({ role: message.role, content: message.content.slice(0, MAX_CONTENT_LENGTH) }));
}

function applyEvent(message: AssistantMessage, event: ChatEvent): AssistantMessage {
  switch (event.type) {
    case 'text':
      return { ...message, content: message.content + event.delta };
    case 'tool_call':
      return {
        ...message,
        toolCalls: [...message.toolCalls, { id: event.id, name: event.name, input: event.input ?? {}, status: 'running' }],
      };
    case 'tool_result':
      return {
        ...message,
        toolCalls: message.toolCalls.map(call =>
          call.id === event.id ? { ...call, status: event.isError ? 'error' : 'done', output: event.output } : call),
      };
    case 'done':
      return { ...message, status: 'done' };
    case 'error':
      return { ...message, status: 'error', error: event.message };
  }
}

export function useChatStream() {
  const { account } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>(() => chatStorage.load(account.id));
  const abortRef = useRef<AbortController | null>(null);
  const isStreaming = messages.some(message => message.role === 'assistant' && message.status === 'streaming');

  useEffect(() => {
    if (!isStreaming) {
      chatStorage.save(account.id, messages);
    }
  }, [account.id, messages, isStreaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const updateAssistant = useCallback((id: string, update: (message: AssistantMessage) => AssistantMessage) => {
    setMessages(current => current.map(message =>
      message.id === id && message.role === 'assistant' ? update(message) : message));
  }, []);

  const run = useCallback(async (text: string, base: ChatMessage[]) => {
    const content = text.trim();

    if (!content || isStreaming) {
      return;
    }

    const assistantId = crypto.randomUUID();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages([
      ...base,
      { id: crypto.randomUUID(), role: 'user', content },
      { id: assistantId, role: 'assistant', content: '', toolCalls: [], status: 'streaming' },
    ]);

    try {
      await postSse('/chat', {
        body: { message: content, history: toHistory(base) },
        signal: controller.signal,
        onMessage: ({ data }) => updateAssistant(assistantId, message => applyEvent(message, data as ChatEvent)),
      });

      updateAssistant(assistantId, message => (message.status === 'streaming' ? { ...message, status: 'done' } : message));
    } catch (error) {
      if (controller.signal.aborted) {
        updateAssistant(assistantId, message => ({ ...message, status: 'stopped' }));
        return;
      }

      const description = error instanceof ApiError ? error.message : 'A conexão com o assistente caiu.';
      updateAssistant(assistantId, message => ({ ...message, status: 'error', error: description }));
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [isStreaming, updateAssistant]);

  const send = useCallback((text: string) => run(text, messages), [run, messages]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find(message => message.role === 'user');

    if (!lastUser || isStreaming) {
      return;
    }

    void run(lastUser.content, messages.slice(0, messages.lastIndexOf(lastUser)));
  }, [isStreaming, messages, run]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
  }, []);

  return { messages, isStreaming, send, stop, retry, clear };
}
