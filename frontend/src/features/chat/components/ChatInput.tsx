import { ArrowUp, Square } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MAX_LENGTH = 2000;

type ChatInputProps = {
  isStreaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

export function ChatInput({ isStreaming, onSend, onStop }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus();
    }
  }, [isStreaming]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();

    if (!value.trim() || isStreaming) {
      return;
    }

    onSend(value);
    setValue('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      submit(event);
    }
  };

  return (
    <form onSubmit={submit} className="relative rounded-2xl border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring/50">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={event => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Pergunte sobre o catálogo..."
        aria-label="Mensagem para o assistente"
        maxLength={MAX_LENGTH}
        rows={1}
        className="max-h-[200px] min-h-12 resize-none border-0 bg-transparent py-3.5 pr-14 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      {isStreaming ? (
        <Button type="button" size="icon" variant="secondary" onClick={onStop} className="absolute right-2 bottom-2 rounded-full" aria-label="Parar resposta">
          <Square className="fill-current" />
        </Button>
      ) : (
        <Button type="submit" size="icon" disabled={!value.trim()} className="absolute right-2 bottom-2 rounded-full" aria-label="Enviar mensagem">
          <ArrowUp />
        </Button>
      )}
    </form>
  );
}
