import { Bot, CircleAlert, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { extractProducts } from '../toolResults';
import type { AssistantMessage, ChatMessage } from '../types';
import { ChatProductCards } from './ChatProductCards';
import { Markdown } from './Markdown';
import { ToolCallIndicator } from './ToolCallIndicator';

export function MessageBubble({ message, onRetry }: { message: ChatMessage; onRetry?: () => void }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 whitespace-pre-wrap text-primary-foreground sm:max-w-[75%]">
          {message.content}
        </p>
      </div>
    );
  }

  return <AssistantBubble message={message} onRetry={onRetry} />;
}

function AssistantBubble({ message, onRetry }: { message: AssistantMessage; onRetry?: () => void }) {
  const products = extractProducts(message.toolCalls);
  const isThinking = message.status === 'streaming' && !message.content && message.toolCalls.every(call => call.status !== 'running');

  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bot className="size-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-3 pt-1">
        {message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.toolCalls.map(call => <ToolCallIndicator key={call.id} call={call} />)}
          </div>
        )}

        {isThinking && (
          <div className="flex gap-1 py-2" aria-label="Pensando">
            {[0, 150, 300].map(delay => (
              <span
                key={delay}
                className="size-2 animate-bounce rounded-full bg-muted-foreground/50"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}

        {message.content && (
          <div className="text-sm sm:text-base">
            <Markdown content={message.content} />
            {message.status === 'streaming' && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-foreground/70 align-middle" aria-hidden />
            )}
          </div>
        )}

        {message.status !== 'streaming' && <ChatProductCards products={products} />}

        {message.status === 'stopped' && (
          <p className="text-xs text-muted-foreground">Resposta interrompida.</p>
        )}

        {message.status === 'error' && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
            <CircleAlert className="size-4 shrink-0 text-destructive" />
            <span className="flex-1">{message.error ?? 'Não foi possível responder.'}</span>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw />
                Tentar novamente
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
