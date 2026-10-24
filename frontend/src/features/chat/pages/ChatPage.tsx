import { SquarePen } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/authContext';

import { ChatInput } from '../components/ChatInput';
import { MessageBubble } from '../components/MessageBubble';
import { SuggestedPrompts } from '../components/SuggestedPrompts';
import { useChatStream } from '../useChatStream';

const STICK_TO_BOTTOM_THRESHOLD = 120;

export function ChatPage() {
  const { company } = useSession();
  const { messages, isStreaming, send, stop, retry, clear } = useChatStream();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastMessageId = messages.at(-1)?.id;

  const onScroll = () => {
    const element = scrollRef.current;

    if (element) {
      stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < STICK_TO_BOTTOM_THRESHOLD;
    }
  };

  useEffect(() => {
    const element = scrollRef.current;

    if (element && stickToBottom.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    stickToBottom.current = true;
  }, [lastMessageId]);

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100svh-3.5rem)] flex-col sm:-mx-6">
      <div className="flex items-center justify-between border-b px-4 py-2 sm:px-6">
        <div>
          <h1 className="font-semibold">Assistente</h1>
          <p className="text-xs text-muted-foreground">Catálogo da {company.name}</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <SquarePen />
            Nova conversa
          </Button>
        )}
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <SuggestedPrompts companyName={company.name} onSelect={send} />
          ) : (
            <div className="space-y-6" aria-live="polite">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onRetry={index === messages.length - 1 ? retry : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-3xl space-y-2">
          <ChatInput isStreaming={isStreaming} onSend={send} onStop={stop} />
          <p className="text-center text-xs text-muted-foreground">
            Respostas geradas por IA a partir do catálogo. Confira preços antes de comprar.
          </p>
        </div>
      </div>
    </div>
  );
}
